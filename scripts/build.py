#!/usr/bin/env python3
"""Create deterministic skill ZIPs, a collection ZIP, manifest, and SHA-256 checksums."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import shutil
import zipfile
from validate import ROOT, validate, skill_files

def make_zip(destination, entries):
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, source in sorted(entries):
            item = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            mode = 0o755 if source.stat().st_mode & 0o111 else 0o644
            item.external_attr = (0o100000 | mode) << 16
            archive.writestr(item, source.read_bytes())

def build(output):
    names = validate()
    output.mkdir(parents=True, exist_ok=True)
    package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
    try:
        commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, stderr=subprocess.DEVNULL, text=True).strip()
    except subprocess.CalledProcessError:
        commit = 'uncommitted'
    collections = [('LICENSE', ROOT / 'LICENSE'), ('README.md', ROOT / 'README.md')]
    paths = []
    for name in names:
        folder = ROOT / 'skills' / name
        entries = [(name + '/' + file.relative_to(folder).as_posix(), file) for file in skill_files(folder)]
        entries.append((name + '/LICENSE', ROOT / 'LICENSE'))
        archive = output / (name + '.zip')
        make_zip(archive, entries)
        paths.append(archive)
        collections.extend(('skills/' + entry, file) for entry, file in entries)
    collection = output / 'academic-workflow-skills.zip'
    make_zip(collection, collections)
    paths.append(collection)
    installer = output / 'install.sh'
    shutil.copyfile(ROOT / 'install.sh', installer)
    installer.chmod(0o755)
    catalog = output / 'skills.txt'
    with catalog.open('w', encoding='utf-8', newline='\n') as file:
        file.write('\n'.join(names) + '\n')
    manifest = {
        'version': package['version'], 'commit': commit, 'skills': names,
        'archives': [{'file': file.name, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()} for file in paths],
        'optionalDependencies': json.loads((ROOT / 'dependencies.json').read_text(encoding='utf-8'))['openPencil'],
        'installer': {'file': installer.name, 'sha256': hashlib.sha256(installer.read_bytes()).hexdigest()},
        'catalog': {'file': catalog.name, 'sha256': hashlib.sha256(catalog.read_bytes()).hexdigest()}
    }
    manifest_path = output / 'manifest.json'
    with manifest_path.open('w', encoding='utf-8', newline='\n') as file:
        file.write(json.dumps(manifest, indent=2) + '\n')
    paths.extend([installer, catalog, manifest_path])
    with (output / 'SHA256SUMS').open('w', encoding='utf-8', newline='\n') as file:
        file.write(''.join(hashlib.sha256(item.read_bytes()).hexdigest() + '  ' + item.name + '\n' for item in paths))
    print('Built', len(names), 'individual ZIPs and one collection ZIP in', output)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    build(args.output.resolve())
