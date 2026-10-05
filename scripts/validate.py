#!/usr/bin/env python3
"""Validate the public skill collection using only Python's standard library."""
import json
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

def skill_files(folder):
    """Return distributable files without OS metadata or local runtime caches."""
    ignored_dirs = {'.git', 'node_modules', '__pycache__', '.venv', '.pytest_cache'}
    for directory, dirs, files in os.walk(folder, followlinks=False):
        dirs[:] = sorted(name for name in dirs if name not in ignored_dirs)
        for name in dirs:
            if (Path(directory) / name).is_symlink():
                raise ValueError('Skill distributions must not contain symlinked directories')
        for name in sorted(files):
            if name in {'.DS_Store', 'Thumbs.db', '.env'} or name.startswith('.env.') or name.endswith(('.pyc', '.pyo')):
                continue
            file = Path(directory) / name
            if file.is_symlink():
                raise ValueError('Skill distributions must not contain symlinks: ' + str(file))
            yield file

def validate(root=ROOT):
    config = json.loads((root / 'dependencies.json').read_text(encoding='utf-8'))
    names = config['skills']
    found = sorted(p.name for p in (root / 'skills').iterdir() if p.is_dir())
    if sorted(names) != found:
        raise ValueError('dependencies.json skills must match skills/ directories')
    for name in names:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name):
            raise ValueError('Invalid skill directory name: ' + name)
        folder = root / 'skills' / name
        skill = folder / 'SKILL.md'
        text = skill.read_text(encoding='utf-8')
        if not text.startswith('---\n'):
            raise ValueError(str(skill) + ': missing YAML frontmatter')
        parts = text.split('---', 2)
        if len(parts) != 3:
            raise ValueError(str(skill) + ': unclosed frontmatter')
        front = parts[1]
        match = re.search(r'^name:\s*[\'\"]?([a-z0-9-]+)[\'\"]?\s*$', front, re.M)
        if not match or match.group(1) != name:
            raise ValueError(str(skill) + ': frontmatter name does not match directory')
        if not re.search(r'^description:\s*\S', front, re.M):
            raise ValueError(str(skill) + ': missing description')
        for file in skill_files(folder):
            if file.suffix == '.md':
                content = file.read_text(encoding='utf-8')
                if re.search(r'/(Users|Volumes)/', content):
                    raise ValueError('Machine-specific path in ' + str(file))
                if '[TODO:' in content:
                    raise ValueError('Unfinished scaffold in ' + str(file))
                for link in re.findall(r'\]\(([^)]+)\)', content):
                    if link.startswith(('https://', 'http://', '#', 'mailto:')):
                        continue
                    target = (file.parent / link.split('#')[0]).resolve()
                    if not target.is_relative_to(folder.resolve()) or not target.is_file():
                        raise ValueError('Missing or external local reference in ' + str(file) + ': ' + link)
    print('Validated ' + str(len(names)) + ' skills and their local references.')
    return names

if __name__ == '__main__':
    try:
        validate()
    except (ValueError, OSError, KeyError) as error:
        print('Validation failed:', error, file=sys.stderr)
        sys.exit(1)
