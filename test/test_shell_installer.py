"""Exercise the real Bash installer against local release fixtures, without network or HOME changes."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
WRITING = 'academic-paper-writing'
DRAWING = 'academic-diagram-design'


@unittest.skipIf(os.name == 'nt', 'The shell installer targets macOS/Linux; Windows uses ZIP or Skills CLI.')
class ShellInstallerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.shared = tempfile.TemporaryDirectory(prefix='academic-workflow-shell-fixtures-')
        cls.artifacts = Path(cls.shared.name) / 'release'
        subprocess.run([sys.executable, str(ROOT / 'scripts/build.py'), '--output', str(cls.artifacts)], check=True, capture_output=True)

    @classmethod
    def tearDownClass(cls):
        cls.shared.cleanup()

    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='academic-workflow-shell-test-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.release = self.root / 'release'
        shutil.copytree(self.artifacts, self.release)
        self.work = self.root / 'workspace with spaces'
        self.work.mkdir()
        self.destination = self.work / 'installed skills'
        self.tools = self.root / 'fake-bin'
        self.tools.mkdir()
        curl = self.tools / 'curl'
        curl.write_text(
            '#!' + sys.executable + '\n'
            + 'import os,sys,shutil\n'
            + 'from pathlib import Path\n'
            + 'from urllib.parse import urlsplit\n'
            + 'args=sys.argv[1:]; url=args[-1]\n'
            + 'if url.endswith("/releases/latest"):\n'
            + ' print("https://github.com/zzzhy03/academic-workflow/releases/tag/v0.2.0",end="");sys.exit(0)\n'
            + 'source=Path(os.environ["ACADEMIC_TEST_RELEASE"])/Path(urlsplit(url).path).name\n'
            + 'if not source.is_file():sys.exit(22)\n'
            + 'target=Path(args[args.index("--output")+1]);shutil.copyfile(source,target)\n',
            encoding='utf-8'
        )
        curl.chmod(0o755)
        self.environment = {
            **os.environ,
            'PATH': str(self.tools) + os.pathsep + os.environ.get('PATH', ''),
            'ACADEMIC_TEST_RELEASE': str(self.release),
        }

    def run_installer(self, *args, piped=False):
        if piped:
            command = ['/bin/bash', '-s', '--', *args]
            text = (ROOT / 'install.sh').read_text(encoding='utf-8')
        else:
            command = ['/bin/bash', str(ROOT / 'install.sh'), *args]
            text = None
        return subprocess.run(command, input=text, text=True, cwd=self.work,
                              env=self.environment, capture_output=True, timeout=30)

    def checksums(self):
        members = [p for p in self.release.iterdir() if p.is_file() and p.name != 'SHA256SUMS']
        (self.release / 'SHA256SUMS').write_text(
            ''.join(hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name + '\n' for p in members),
            encoding='utf-8'
        )

    def assert_ok(self, result):
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_piped_single_install_for_claude(self):
        result = self.run_installer('--agent', 'claude-code', '--project', '--skill', WRITING, piped=True)
        self.assert_ok(result)
        target = self.work / '.claude/skills' / WRITING
        self.assertEqual((target / 'SKILL.md').read_bytes(), (ROOT / 'skills' / WRITING / 'SKILL.md').read_bytes())
        self.assertTrue((target / 'references/writing-and-consistency.md').is_file())
        self.assertFalse((self.work / '.agents').exists())
        self.assertFalse((target.parent / DRAWING).exists())

    def test_multiple_selection_and_spaces(self):
        result = self.run_installer('--dest', str(self.destination), '--skill', WRITING,
                                    '--skill', DRAWING, '--skill', WRITING, '--version', 'v0.2.0')
        self.assert_ok(result)
        self.assertEqual(sorted(p.name for p in self.destination.iterdir()), sorted([WRITING, DRAWING]))

    def test_default_all_for_codex_project(self):
        self.assert_ok(self.run_installer('--project'))
        for name in [WRITING, DRAWING]:
            self.assertTrue((self.work / '.agents/skills' / name / 'SKILL.md').is_file())

    def test_catalog_and_dry_run_do_not_create_install_directory(self):
        result = self.run_installer('--list')
        self.assert_ok(result)
        self.assertEqual(set(result.stdout.splitlines()), {WRITING, DRAWING})
        self.assert_ok(self.run_installer('--dest', str(self.destination), '--dry-run'))
        self.assertFalse(self.destination.exists())

    def test_existing_install_needs_replace_and_old_files_are_backed_up(self):
        target = self.destination / WRITING
        target.mkdir(parents=True)
        (target / 'old-note.md').write_text('local version', encoding='utf-8')
        other = self.destination / 'unrelated'
        other.mkdir()
        (other / 'keep').write_text('keep', encoding='utf-8')
        args = ['--dest', str(self.destination), '--skill', WRITING]
        self.assertNotEqual(self.run_installer(*args).returncode, 0)
        self.assertTrue((target / 'old-note.md').exists())
        self.assert_ok(self.run_installer(*args, '--replace'))
        self.assertTrue((target / 'SKILL.md').exists())
        self.assertFalse((target / 'old-note.md').exists())
        backups = list(self.work.glob('.academic-workflow-backup.*'))
        self.assertEqual(len(backups), 1)
        self.assertEqual((backups[0] / WRITING / 'old-note.md').read_text(), 'local version')
        self.assertEqual((other / 'keep').read_text(), 'keep')

    def test_corrupt_download_does_not_replace_existing_install(self):
        target = self.destination / WRITING
        target.mkdir(parents=True)
        (target / 'keep').write_text('keep', encoding='utf-8')
        with (self.release / (WRITING + '.zip')).open('ab') as file:
            file.write(b'corruption')
        result = self.run_installer('--dest', str(self.destination), '--skill', WRITING, '--replace')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((target / 'keep').read_text(), 'keep')
        self.assertFalse(list(self.work.glob('.academic-workflow-backup.*')))

    def test_bad_archive_paths_are_rejected_before_writes(self):
        archive = self.release / (WRITING + '.zip')
        with zipfile.ZipFile(archive, 'w') as packed:
            packed.writestr('../escaped', 'bad')
            packed.writestr(WRITING + '/SKILL.md', 'instructions')
        self.checksums()
        result = self.run_installer('--dest', str(self.destination), '--skill', WRITING)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.destination.exists())
        self.assertFalse((self.work / 'escaped').exists())

    def test_symlink_entries_and_existing_symlink_installs_are_rejected(self):
        archive = self.release / (WRITING + '.zip')
        with zipfile.ZipFile(archive, 'w') as packed:
            packed.writestr(WRITING + '/SKILL.md', 'instructions')
            entry = zipfile.ZipInfo(WRITING + '/linked')
            entry.create_system = 3
            entry.external_attr = 0o120777 << 16
            packed.writestr(entry, '../../outside')
        self.checksums()
        self.assertNotEqual(self.run_installer('--dest', str(self.destination), '--skill', WRITING).returncode, 0)
        self.assertFalse(self.destination.exists())
        shutil.copyfile(self.artifacts / (WRITING + '.zip'), archive)
        self.checksums()
        self.destination.mkdir()
        source = self.work / 'authoring-source'
        source.mkdir()
        (source / 'keep').write_text('source', encoding='utf-8')
        (self.destination / WRITING).symlink_to(source, target_is_directory=True)
        result = self.run_installer('--dest', str(self.destination), '--skill', WRITING, '--replace')
        self.assertNotEqual(result.returncode, 0)
        self.assertTrue((self.destination / WRITING).is_symlink())
        self.assertEqual((source / 'keep').read_text(), 'source')

    def test_unknown_skill_and_changed_catalog_are_rejected(self):
        self.assertNotEqual(self.run_installer('--dest', str(self.destination), '--skill', '../../elsewhere').returncode, 0)
        (self.release / 'skills.txt').write_text('other-skill\n', encoding='utf-8')
        self.assertNotEqual(self.run_installer('--dest', str(self.destination)).returncode, 0)
        self.assertFalse(self.destination.exists())


if __name__ == '__main__':
    unittest.main()
