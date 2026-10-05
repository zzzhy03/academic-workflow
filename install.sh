#!/usr/bin/env bash
# Install instruction-only skills from an Academic Workflow GitHub Release.
# Compatible with macOS Bash 3.2 and Linux Bash. No Node, Python, Git, or jq required.
set -euo pipefail

repo="https://github.com/zzzhy03/academic-workflow"
agent="codex"
scope="global"
version="latest"
destination=""
replace=0
list_only=0
dry_run=0
all=0
selected=()
temp_dir=""
stage_dir=""
backup_dir=""
pending_target=""
pending_backup=""

die() { printf 'academic-workflow: %s\n' "$*" >&2; exit 1; }
help() {
  cat <<'HELP'
Install Academic Workflow skills from a GitHub Release (v0.2.0 or newer).
Usage: bash install.sh [options]

--skill NAME      Select a skill; repeat for several
--all             Install all collection skills (default if none selected)
--agent NAME      codex (default) or claude-code
--global          User-wide skill directory (default)
--project         Skill directory under the current project
--dest DIRECTORY  Explicit destination directory, overriding agent/scope
--version TAG     latest (default) or a release tag such as v0.2.0
--replace         Replace selected existing skills and retain a backup
--list            List skills in the selected release without installing
--dry-run         Fetch/verify the catalog and print the plan; do not install
--help            Show this help

Requires Bash, curl, unzip, awk, and sha256sum or shasum.
Codex defaults to ~/.agents/skills; Claude Code to ~/.claude/skills.
Use --dest for an existing legacy/custom installation.
OpenPencil software/MCP setup remains a separate optional workflow.
HELP
}
cleanup() {
  local result=$?
  if [ -n "$pending_backup" ] && [ ! -e "$pending_target" ] && [ ! -L "$pending_target" ]; then
    mv "$pending_backup" "$pending_target" ||
      printf 'Restore the previous installation from %s\n' "$pending_backup" >&2
  fi
  [ -z "$stage_dir" ] || rm -rf -- "$stage_dir"
  [ -z "$temp_dir" ] || rm -rf -- "$temp_dir"
  return "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skill|--agent|--dest|--version)
      [ "$#" -ge 2 ] && [ -n "$2" ] || die "$1 requires a value."
      case "$2" in --*) die "$1 requires a value." ;; esac
      case "$1" in
        --skill) selected["${#selected[@]}"]="$2" ;;
        --agent) agent="$2" ;;
        --dest) destination="$2" ;;
        --version) version="$2" ;;
      esac
      shift 2 ;;
    --all) all=1; shift ;;
    --global) scope="global"; shift ;;
    --project) scope="project"; shift ;;
    --replace) replace=1; shift ;;
    --list) list_only=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    --help|-h) help; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
done
case "$agent" in codex|claude-code) ;; *) die "Choose --agent codex or claude-code." ;; esac
if [ "$all" -eq 1 ] && [ "${#selected[@]}" -gt 0 ]; then die "Choose --all or --skill, not both."; fi
for command in curl unzip awk mktemp; do command -v "$command" >/dev/null || die "Required command missing: $command"; done
if command -v sha256sum >/dev/null; then hash_command="sha256sum"
elif command -v shasum >/dev/null; then hash_command="shasum"
else die "Install sha256sum or shasum to verify release files."
fi

download() {
  curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
    --retry 2 --connect-timeout 15 --max-time 120 --output "$2" "$1"
}
if [ "$version" = "latest" ]; then
  resolved=$(curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
    --retry 2 --connect-timeout 15 --max-time 60 --output /dev/null --write-out '%{url_effective}' "$repo/releases/latest")
  case "$resolved" in "$repo/releases/tag/"*) version="${resolved##*/}" ;; *) die "Could not resolve the latest release." ;; esac
fi
[[ "$version" =~ ^v[0-9][A-Za-z0-9._-]*$ ]] || die "Invalid release tag."
base="$repo/releases/download/$version"
temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/academic-workflow.XXXXXX")
download "$base/SHA256SUMS" "$temp_dir/SHA256SUMS"
verify() {
  local file="$1" expected actual
  expected=$(awk -v file="$file" '$2 == file {print $1}' "$temp_dir/SHA256SUMS")
  [[ "$expected" =~ ^[0-9a-fA-F]{64}$ ]] || die "Missing or ambiguous checksum for $file."
  if [ "$hash_command" = "sha256sum" ]; then
    actual=$(sha256sum "$temp_dir/$file")
  else
    actual=$(shasum -a 256 "$temp_dir/$file")
  fi
  actual="${actual%% *}"
  [ "$actual" = "$expected" ] || die "Checksum mismatch: $file"
}
download "$base/skills.txt" "$temp_dir/skills.txt" ||
  die "This release has no installer catalog. Use v0.2.0 or newer, or download its ZIPs manually."
verify "skills.txt"
available=()
while IFS= read -r name || [ -n "$name" ]; do
  [[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || die "Invalid name in release catalog."
  available["${#available[@]}"]="$name"
done < "$temp_dir/skills.txt"
[ "${#available[@]}" -gt 0 ] || die "The release contains no skills."
if [ "$list_only" -eq 1 ]; then printf '%s\n' "${available[@]}"; exit 0; fi
if [ "${#selected[@]}" -eq 0 ]; then selected=("${available[@]}"); fi
unique=()
for name in "${selected[@]}"; do
  found=0
  for candidate in "${available[@]}"; do [ "$name" != "$candidate" ] || found=1; done
  [ "$found" -eq 1 ] || die "Unknown skill: $name"
  duplicate=0
  if [ "${#unique[@]}" -gt 0 ]; then
    for candidate in "${unique[@]}"; do [ "$name" != "$candidate" ] || duplicate=1; done
  fi
  [ "$duplicate" -eq 1 ] || unique["${#unique[@]}"]="$name"
done
selected=("${unique[@]}")
if [ -z "$destination" ]; then
  if [ "$scope" = "project" ]; then prefix="$PWD"; else prefix="$HOME"; fi
  if [ "$agent" = "codex" ]; then destination="$prefix/.agents/skills"
  else destination="$prefix/.claude/skills"
  fi
fi
case "$destination" in /*) ;; *) destination="$PWD/$destination" ;; esac
printf 'Release: %s\nDestination: %s\n' "$version" "$destination"
printf 'Selected: %s\n' "${selected[*]}"
if [ "$dry_run" -eq 1 ]; then printf 'Dry run: installation directory unchanged.\n'; exit 0; fi

# Download and check every selected archive before changing any installed skill.
mkdir "$temp_dir/extracted"
for name in "${selected[@]}"; do
  download "$base/$name.zip" "$temp_dir/$name.zip"
  verify "$name.zip"
  unzip -Z1 "$temp_dir/$name.zip" > "$temp_dir/members"
  while IFS= read -r member; do
    case "$member" in "$name/"*) ;; *) die "Unexpected archive path: $member" ;; esac
    case "/$member" in *"/../"*|*"/./"*|*\\*) die "Unsafe archive path." ;; esac
  done < "$temp_dir/members"
  unzip -Z -l "$temp_dir/$name.zip" | awk '$1 ~ /^l/ {exit 1}' ||
    die "Symlinks are not allowed in skill archives."
  unzip -q "$temp_dir/$name.zip" -d "$temp_dir/extracted"
  [ -f "$temp_dir/extracted/$name/SKILL.md" ] || die "$name is missing SKILL.md."
  target="$destination/$name"
  [ ! -L "$target" ] || die "$target is a symlink; update its source or choose another --dest."
  if [ -e "$target" ] && [ "$replace" -eq 0 ]; then
    die "$target already exists. Use --replace to update it with a retained backup."
  fi
done

mkdir -p "$destination"
destination=$(cd "$destination" && pwd -P)
parent=$(dirname "$destination")
stage_dir=$(mktemp -d "$parent/.academic-workflow-stage.XXXXXX")
for name in "${selected[@]}"; do cp -R "$temp_dir/extracted/$name" "$stage_dir/$name"; done
for name in "${selected[@]}"; do
  target="$destination/$name"
  # Recheck in case the destination changed while downloads were running.
  [ ! -L "$target" ] || die "$target became a symlink; installation stopped."
  pending_target="$target"
  pending_backup=""
  if [ -e "$target" ]; then
    [ "$replace" -eq 1 ] || die "$target now exists; installation stopped."
    [ -n "$backup_dir" ] || backup_dir=$(mktemp -d "$parent/.academic-workflow-backup.XXXXXX")
    pending_backup="$backup_dir/$name"
    mv "$target" "$pending_backup"
  fi
  mv "$stage_dir/$name" "$target"
  pending_target=""
  pending_backup=""
  printf 'Installed %s from %s\n' "$name" "$version"
done
[ -z "$backup_dir" ] || printf 'Previous selected skills retained in: %s\n' "$backup_dir"
printf 'Done. Reopen or refresh the client if the skills are not listed yet.\n'
