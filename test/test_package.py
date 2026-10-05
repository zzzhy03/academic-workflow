import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]


class DistributionTests(unittest.TestCase):
    def test_archives_are_complete_and_repeatable(self):
        with tempfile.TemporaryDirectory() as directory:
            outputs = [Path(directory) / 'first', Path(directory) / 'second']
            for output in outputs:
                subprocess.run([sys.executable, str(ROOT / 'scripts/build.py'), '--output', str(output)], check=True, capture_output=True)
            first, second = outputs
            names = json.loads((ROOT / 'dependencies.json').read_text(encoding='utf-8'))['skills']
            self.assertEqual((first / 'install.sh').read_bytes(), (ROOT / 'install.sh').read_bytes())
            self.assertEqual((first / 'skills.txt').read_text(encoding='utf-8').splitlines(), names)
            for name in ['skills.txt', 'manifest.json', 'SHA256SUMS']:
                self.assertNotIn(b'\r\n', (first / name).read_bytes())
            for name in names:
                archive = first / (name + '.zip')
                self.assertEqual(archive.read_bytes(), (second / archive.name).read_bytes())
                with zipfile.ZipFile(archive) as packed:
                    for source in (ROOT / 'skills' / name).rglob('*'):
                        if source.is_file() and source.name != '.DS_Store':
                            member = name + '/' + source.relative_to(ROOT / 'skills' / name).as_posix()
                            self.assertEqual(packed.read(member), source.read_bytes())
                    self.assertEqual(packed.read(name + '/LICENSE'), (ROOT / 'LICENSE').read_bytes())
            with zipfile.ZipFile(first / 'academic-workflow-skills.zip') as packed:
                self.assertEqual(packed.read('LICENSE'), (ROOT / 'LICENSE').read_bytes())
                for name in names:
                    self.assertIn('skills/' + name + '/SKILL.md', packed.namelist())
            for line in (first / 'SHA256SUMS').read_text(encoding='utf-8').splitlines():
                digest, file = line.split('  ', 1)
                self.assertEqual(digest, hashlib.sha256((first / file).read_bytes()).hexdigest())

    def test_packager_omits_system_metadata(self):
        spec = importlib.util.spec_from_file_location('validate', ROOT / 'scripts/validate.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'SKILL.md').write_text('Instructions', encoding='utf-8')
            (root / '.DS_Store').write_bytes(b'Finder metadata')
            (root / '__pycache__').mkdir()
            (root / '__pycache__/generated.pyc').write_bytes(b'Cache')
            self.assertEqual([p.name for p in module.skill_files(root)], ['SKILL.md'])

    def test_validator_rejects_missing_reference(self):
        spec = importlib.util.spec_from_file_location('validate', ROOT / 'scripts/validate.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'dependencies.json').write_text(json.dumps({'skills': ['example']}), encoding='utf-8')
            folder = root / 'skills/example'
            folder.mkdir(parents=True)
            (folder / 'SKILL.md').write_text('---\nname: example\ndescription: Test\n---\n[Missing](references/missing.md)\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Missing or external'):
                module.validate(root)


if __name__ == '__main__':
    unittest.main()
