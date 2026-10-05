#!/usr/bin/env bash
# Academic Workflow: install release skills and optional drawing tools.
set -euo pipefail

# BEGIN RELEASE DATA
release_version="development"
available=()
checksum_for() { return 1; }
# END RELEASE DATA

repo="https://github.com/zzzhy03/academic-workflow"
original_args=("$@")
action="install"
agent="auto"
scope="global"
version="latest"
destination=""
with_openpencil=0
mcp_root="$PWD"
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
Academic Workflow
Usage: bash install.sh [install|update] [options]

update               Update selected skills, keeping previous directories as backups
--skill NAME         Select a skill; repeat for several
--all                Install all collection skills (default)
--agent TARGET       auto (default), all, codex, claude-code
--global             User-wide installation (default)
--project            Install under the current project
--dest DIRECTORY     Explicit skill installation directory
--version TAG        latest (default), or a tag such as v0.3.0
--with-openpencil     Add the official skill, CLI/MCP, and register selected clients
--mcp-root DIRECTORY  OpenPencil access directory (default: current directory)
--list               List skills without installing
--dry-run            Show the plan without installing
--help               Show this help

File installation needs Bash, curl, and unzip on macOS/Linux.
OpenPencil setup additionally needs Node/npm and the selected client CLIs.
The desktop application is installed separately.
HELP
}
cleanup() {
  local result=$?
  if [ -n "$pending_backup" ] && [ ! -e "$pending_target" ] && [ ! -L "$pending_target" ]; then
    mv "$pending_backup" "$pending_target" || printf 'Restore from %s\n' "$pending_backup" >&2
  fi
  if [ "$result" -ne 0 ] && [ -n "$backup_dir" ]; then printf 'Backup retained: %s\n' "$backup_dir" >&2; fi
  [ -z "$stage_dir" ] || rm -rf -- "$stage_dir"
  [ -z "$temp_dir" ] || rm -rf -- "$temp_dir"
  return "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if [ "$#" -gt 0 ]; then
  case "$1" in install|update) action="$1"; shift ;; esac
fi
while [ "$#" -gt 0 ]; do
  case "$1" in
    --skill|--agent|--dest|--version|--mcp-root)
      [ "$#" -ge 2 ] && [ -n "$2" ] || die "$1 requires a value."
      case "$2" in --*) die "$1 requires a value." ;; esac
      case "$1" in
        --skill) selected["${#selected[@]}"]="$2" ;;
        --agent) agent="$2" ;;
        --dest) destination="$2" ;;
        --version) version="$2" ;;
        --mcp-root) mcp_root="$2" ;;
      esac
      shift 2 ;;
    --all) all=1; shift ;;
    --global) scope="global"; shift ;;
    --project) scope="project"; shift ;;
    --with-openpencil) with_openpencil=1; shift ;;
    --list) list_only=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    --help|-h) help; exit 0 ;;
    *) die "Unknown option: $1. Use update to update an existing installation." ;;
  esac
done
case "$agent" in auto|all|codex|claude-code) ;; *) die "Unsupported --agent value." ;; esac
if [ "$all" -eq 1 ] && [ "${#selected[@]}" -gt 0 ]; then die "Choose --all or --skill."; fi
for command in curl unzip awk mktemp; do command -v "$command" >/dev/null || die "Required system command missing: $command"; done

download() {
  curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
    --retry 2 --connect-timeout 15 --max-time 120 --output "$2" "$1"
}
if [ "$version" = "latest" ]; then
  resolved=$(curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
    --retry 2 --connect-timeout 15 --max-time 60 --output /dev/null --write-out '%{url_effective}' "$repo/releases/latest")
  case "$resolved" in "$repo/releases/tag/"*) version="${resolved##*/}" ;; *) die "Could not resolve latest release." ;; esac
fi
[[ "$version" =~ ^v[0-9][A-Za-z0-9._-]*$ ]] || die "Invalid release tag."
base="$repo/releases/download/$version"
temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/academic-workflow.XXXXXX")
if [ "$release_version" != "$version" ]; then
  [ -z "${ACADEMIC_WORKFLOW_EXPECTED_VERSION:-}" ] || die "Release installer version mismatch."
  download "$base/install.sh" "$temp_dir/version-install.sh"
  grep -q '# BEGIN RELEASE DATA' "$temp_dir/version-install.sh" || die "Use this installer with v0.3.0 or newer; older ZIPs can be installed manually."
  if [ "${#original_args[@]}" -gt 0 ]; then
    ACADEMIC_WORKFLOW_EXPECTED_VERSION="$version" bash "$temp_dir/version-install.sh" "${original_args[@]}" --version "$version"
  else
    ACADEMIC_WORKFLOW_EXPECTED_VERSION="$version" bash "$temp_dir/version-install.sh" --version "$version"
  fi
  exit $?
fi
verify() {
  local file="$1" expected actual
  expected=$(checksum_for "$file") || die "No embedded checksum for $file."
  if command -v sha256sum >/dev/null; then actual=$(sha256sum "$temp_dir/$file")
  elif command -v shasum >/dev/null; then actual=$(shasum -a 256 "$temp_dir/$file")
  else die "The system has no SHA-256 verification tool."
  fi
  actual="${actual%% *}"
  [ "$actual" = "$expected" ] || die "Checksum mismatch: $file"
}
extract() {
  local file="$1" output="$2" member
  unzip -tq "$temp_dir/$file" >/dev/null || die "Damaged ZIP: $file"
  unzip -Z1 "$temp_dir/$file" > "$temp_dir/members"
  while IFS= read -r member; do
    case "$member" in /*|*\\*) die "Unsafe archive path." ;; esac
    case "/$member" in *"/../"*|*"/./"*) die "Unsafe archive path." ;; esac
  done < "$temp_dir/members"
  unzip -Z -l "$temp_dir/$file" | awk '$1 ~ /^l/ {exit 1}' || die "Archive symlinks are not allowed."
  mkdir -p "$output"
  unzip -q "$temp_dir/$file" -d "$output"
}
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
agents=()
case "$agent" in
  codex|claude-code) agents=("$agent") ;;
  all) agents=("codex" "claude-code") ;;
  auto)
    if command -v codex >/dev/null || [ -d "$HOME/.codex" ]; then agents["${#agents[@]}"]="codex"; fi
    if command -v claude >/dev/null || [ -d "$HOME/.claude" ]; then agents["${#agents[@]}"]="claude-code"; fi
    [ "${#agents[@]}" -gt 0 ] || agents=("codex")
    ;;
esac
destinations=()
if [ -n "$destination" ]; then
  case "$destination" in /*) ;; *) destination="$PWD/$destination" ;; esac
  destinations=("$destination")
else
  if [ "$scope" = "project" ]; then prefix="$PWD"; else prefix="$HOME"; fi
  for client in "${agents[@]}"; do
    if [ "$client" = "codex" ]; then destinations["${#destinations[@]}"]="$prefix/.agents/skills"
    else destinations["${#destinations[@]}"]="$prefix/.claude/skills"
    fi
  done
fi
printf 'Release: %s\nSelected: %s\nClients: %s\n' "$version" "${selected[*]}" "${agents[*]}"
printf 'Destination: %s\n' "${destinations[@]}"
if [ "$with_openpencil" -eq 1 ]; then
  printf 'OpenPencil: official skill, CLI/MCP, root %s\n' "$mcp_root"
  command -v node >/dev/null && command -v npm >/dev/null || die "OpenPencil setup requires Node.js and npm."
  [ -d "$mcp_root" ] || die "--mcp-root must be an existing directory."
  mcp_root=$(cd "$mcp_root" && pwd -P)
fi
if [ "$dry_run" -eq 1 ]; then printf 'Dry run: no installation changes.\n'; exit 0; fi

for name in "${selected[@]}"; do
  download "$base/$name.zip" "$temp_dir/$name.zip"
  verify "$name.zip"
  extract "$name.zip" "$temp_dir/extracted"
  [ -f "$temp_dir/extracted/$name/SKILL.md" ] || die "$name is missing SKILL.md."
done
setup_args=()
if [ "$with_openpencil" -eq 1 ]; then
  download "$base/academic-workflow-skills.zip" "$temp_dir/academic-workflow-skills.zip"
  verify "academic-workflow-skills.zip"
  extract "academic-workflow-skills.zip" "$temp_dir/integration"
  setup_args=("--mcp-root" "$mcp_root")
  for client in "${agents[@]}"; do setup_args["${#setup_args[@]}"]="--agent"; setup_args["${#setup_args[@]}"]="$client"; done
  for directory in "${destinations[@]}"; do setup_args["${#setup_args[@]}"]="--dest"; setup_args["${#setup_args[@]}"]="$directory"; done
  [ "$action" != "update" ] || setup_args["${#setup_args[@]}"]="--update"
  node "$temp_dir/integration/lib/openpencil.mjs" "${setup_args[@]}" --check
fi
for destination in "${destinations[@]}"; do
  for name in "${selected[@]}"; do
    target="$destination/$name"
    [ ! -L "$target" ] || die "$target is a symlink; update its source or select another destination."
    if [ -e "$target" ] && [ "$action" != "update" ]; then die "$target already exists. Run update to keep a backup and install the new version."; fi
  done
done
for destination in "${destinations[@]}"; do
  mkdir -p "$destination"
  destination=$(cd "$destination" && pwd -P)
  parent=$(dirname "$destination")
  stage_dir=$(mktemp -d "$parent/.academic-workflow-stage.XXXXXX")
  for name in "${selected[@]}"; do cp -R "$temp_dir/extracted/$name" "$stage_dir/$name"; done
  backup_dir=""
  for name in "${selected[@]}"; do
    target="$destination/$name"
    [ ! -L "$target" ] || die "$target became a symlink."
    pending_target="$target"; pending_backup=""
    if [ -e "$target" ]; then
      [ "$action" = "update" ] || die "$target now exists; run update."
      [ -n "$backup_dir" ] || backup_dir=$(mktemp -d "$parent/.academic-workflow-backup.XXXXXX")
      pending_backup="$backup_dir/$name"
      mv "$target" "$pending_backup"
    fi
    mv "$stage_dir/$name" "$target"
    pending_target=""; pending_backup=""
    printf 'Installed %s\n' "$target"
  done
  [ -z "$backup_dir" ] || printf 'Previous versions retained: %s\n' "$backup_dir"
  rm -rf -- "$stage_dir"; stage_dir=""
done
if [ "$with_openpencil" -eq 1 ]; then
  node "$temp_dir/integration/lib/openpencil.mjs" "${setup_args[@]}"
fi
printf 'Done. Refresh the client if the skills are not listed yet.\n'
