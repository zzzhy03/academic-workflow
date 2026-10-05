#!/usr/bin/env python3
"""Build only the skill ZIPs, collection ZIP, and a self-contained release installer."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shlex
import zipfile
from validate import ROOT, validate, skill_files

def make_zip(destination, entries):
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, source in sorted(entries):
            item = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            item.external_attr = (0o100644 | (0o111 if source.stat().st_mode & 0o111 else 0)) << 16
            archive.writestr(item, source.read_bytes())

def build(output):
    names = validate()
    output.mkdir(parents=True, exist_ok=True)
    package = json.loads((ROOT/'package.json').read_text(encoding='utf-8'))
    tag = 'v' + package['version']
    if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?', tag):
        raise ValueError('Invalid package version')
    collections = [('LICENSE', ROOT/'LICENSE'), ('README.md', ROOT/'README.md'),
                   ('dependencies.json', ROOT/'dependencies.json'), ('lib/openpencil.mjs', ROOT/'lib/openpencil.mjs')]
    for file in skill_files(ROOT/'integrations/open-pencil'):
        collections.append((file.relative_to(ROOT).as_posix(), file))
    paths = []
    for name in names:
        folder = ROOT/'skills'/name
        entries = [(name+'/'+file.relative_to(folder).as_posix(), file) for file in skill_files(folder)]
        entries.append((name+'/LICENSE', ROOT/'LICENSE'))
        archive = output/(name+'.zip')
        make_zip(archive, entries)
        paths.append(archive)
        collections.extend(('skills/'+entry, file) for entry,file in entries)
    collection = output/'academic-workflow-skills.zip'
    make_zip(collection, collections)
    paths.append(collection)
    block = ['# BEGIN RELEASE DATA', 'release_version='+shlex.quote(tag),
             'available=('+' '.join(shlex.quote(name) for name in names)+')',
             'checksum_for() {', '  case "$1" in']
    for file in paths:
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        block.append('    '+shlex.quote(file.name)+') printf \'%s\\n\' '+shlex.quote(digest)+' ;;')
    block += ['    *) return 1 ;;', '  esac', '}', '# END RELEASE DATA']
    template = (ROOT/'install.sh').read_text(encoding='utf-8')
    installer, count = re.subn(r'# BEGIN RELEASE DATA.*?# END RELEASE DATA',
                              lambda _: '\n'.join(block), template, count=1, flags=re.S)
    if count != 1:
        raise ValueError('Installer release-data marker missing')
    with (output/'install.sh').open('w', encoding='utf-8', newline='\n') as file:
        file.write(installer)
    (output/'install.sh').chmod(0o755)
    for retired in ['manifest.json', 'SHA256SUMS', 'skills.txt']:
        (output/retired).unlink(missing_ok=True)
    print('Built',len(paths),'ZIPs and install.sh; release data is embedded in the installer.')

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=ROOT/'dist')
    args=parser.parse_args()
    build(args.output.resolve())
