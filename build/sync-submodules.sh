#!/bin/bash

# Git Submodule Sync - Cross-Platform Shell Version
# Synchronizes git submodules for any project type

set -e  # Exit on any error

# Default configuration
SUBMODULE_BRANCH="${SUBMODULE_BRANCH:-app/docs}"

# Submodule configurations
# Format: "name|path|branch|build_commands|build_output_path|lfs"
declare -a SUBMODULES=(
  "chassis-assets|vendor/assets|${SUBMODULE_BRANCH}|pnpm install --ignore-workspace && pnpm assets:site|dist/web/chassis-docs|true"
  # Add more submodules here:
  # "another-submodule|vendor/other|main|npm install && npm run build|dist|false"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  local level=$1
  local message=$2
  local color=$NC

  case $level in
    "info") color=$BLUE ;;
    "success") color=$GREEN ;;
    "warning") color=$YELLOW ;;
    "error") color=$RED ;;
  esac

  echo -e "${color}[$level]${NC} $message"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Parse submodule configuration
parse_submodule_config() {
  local config=$1
  IFS='|' read -r name path branch build_commands build_output <<< "$config"

  echo "$name"
  echo "$path"
  echo "$branch"
  echo "$build_commands"
  echo "$build_output"
}

# Main sync function for a single submodule
sync_submodule() {
  local submodule_name=$1
  local submodule_path=$2
  local submodule_branch=$3
  local use_lfs=${4:-false}

  log "info" "Syncing $submodule_name..."

  # Check if submodule exists
  if [ ! -d "$submodule_path" ]; then
    log "warning" "$submodule_name not found at $submodule_path, skipping..."
    return 0
  fi

  # Check for uncommitted changes
  if [ -n "$(git -C "$submodule_path" status --porcelain 2>/dev/null)" ]; then
    log "warning" "$submodule_name has uncommitted changes, skipping..."
    return 0
  fi

  # Get current branch
  local current_branch
  current_branch=$(git -C "$submodule_path" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

  # Switch to correct branch if needed
  if [ -n "$submodule_branch" ] && [ "$current_branch" != "$submodule_branch" ]; then
    log "info" "Switching $submodule_name to $submodule_branch branch..."
    git -C "$submodule_path" checkout "$submodule_branch" 2>/dev/null || true
    git -C "$submodule_path" pull origin "$submodule_branch" 2>/dev/null || true
  else
    git submodule update --init --remote "$submodule_path" 2>/dev/null || true
  fi

  # Pull LFS objects if this submodule uses Git LFS
  if [ "$use_lfs" = "true" ]; then
    if command_exists git-lfs || git lfs version >/dev/null 2>&1; then
      log "info" "Fetching Git LFS objects for $submodule_name..."
      git -C "$submodule_path" lfs install
      git -C "$submodule_path" lfs pull
    else
      log "warning" "git-lfs not found — LFS objects will be pointer files for $submodule_name"
    fi
  fi

  log "success" "$submodule_name synced successfully"
}

# Build submodule with custom commands or auto-detect
build_submodule() {
  local submodule_name=$1
  local submodule_path=$2
  local build_commands=$3
  local build_output=$4

  if [ ! -d "$submodule_path" ]; then
    return 0
  fi

  log "info" "Building $submodule_name..."

  # If custom build commands are provided, use them
  if [ -n "$build_commands" ]; then
    log "info" "Running custom build commands..."
    (
      cd "$submodule_path"
      eval "$build_commands"
    ) || {
      log "error" "Build commands failed for $submodule_name"
      return 1
    }

    # Verify build output if specified
    if [ -n "$build_output" ]; then
      local output_path="$submodule_path/$build_output"
      if [ -d "$output_path" ]; then
        local file_count=$(find "$output_path" -type f 2>/dev/null | wc -l | tr -d ' ')
        log "success" "$submodule_name built successfully ($file_count files)"
      else
        log "warning" "Build output not found at expected location: $build_output"
      fi
    else
      log "success" "$submodule_name build completed"
    fi

    return 0
  fi

  # Otherwise, auto-detect project type
  detect_and_build "$submodule_path"
}

# Detect project type and run appropriate build
detect_and_build() {
  local target_path=$1
  local project_type="unknown"

  # iOS/macOS project detection
  if [ -f "$target_path/Package.swift" ] || ls "$target_path"/*.xcodeproj >/dev/null 2>&1 || ls "$target_path"/*.xcworkspace >/dev/null 2>&1; then
    project_type="swift"
    log "info" "Detected Swift/iOS project"

  # Android project detection
  elif [ -f "$target_path/build.gradle" ] || [ -f "$target_path/build.gradle.kts" ] || [ -d "$target_path/app/src" ]; then
    project_type="android"
    log "info" "Detected Android project"

  # React Native detection
  elif [ -f "$target_path/package.json" ] && grep -q "react-native" "$target_path/package.json" 2>/dev/null; then
    project_type="react-native"
    log "info" "Detected React Native project"

  # Flutter detection
  elif [ -f "$target_path/pubspec.yaml" ] && grep -q "flutter" "$target_path/pubspec.yaml" 2>/dev/null; then
    project_type="flutter"
    log "info" "Detected Flutter project"

  # Node.js project detection
  elif [ -f "$target_path/package.json" ]; then
    project_type="node"
    log "info" "Detected Node.js project"
  fi

  # Build based on project type
  case $project_type in
    "node")
      if command_exists pnpm; then
        log "info" "Building with pnpm..."
        (cd "$target_path" && pnpm install && pnpm build)
      elif command_exists npm; then
        log "info" "Building with npm..."
        (cd "$target_path" && npm install && npm run build)
      else
        log "warning" "No package manager found, skipping build"
      fi
      ;;

    "android")
      if [ -f "$target_path/gradlew" ]; then
        log "info" "Building Android project..."
        (cd "$target_path" && ./gradlew build)
      else
        log "warning" "Gradle wrapper not found"
      fi
      ;;

    "swift")
      if command_exists swift; then
        log "info" "Building Swift project..."
        (cd "$target_path" && swift build)
      elif command_exists xcodebuild; then
        log "info" "Building with xcodebuild..."
        (cd "$target_path" && xcodebuild -scheme YourScheme build)
      else
        log "warning" "No Swift build tools found"
      fi
      ;;

    "flutter")
      if command_exists flutter; then
        log "info" "Building Flutter project..."
        (cd "$target_path" && flutter pub get && flutter build)
      else
        log "warning" "Flutter not found"
      fi
      ;;

    *)
      log "warning" "Unknown project type, skipping build"
      ;;
  esac
}

# Check for submodule changes
check_changes() {
  if git submodule status | grep -q "^+"; then
    log "info" "Submodule changes detected"
    log "info" "Run: git add . && git commit -m 'chore: update submodules'"
  else
    log "success" "All submodules are up to date"
  fi
}

# Initialize submodules
initialize_submodules() {
  log "info" "Initializing submodules..."
  git submodule update --init --recursive 2>/dev/null || {
    log "warning" "Some submodules may not be available"
  }
}

# Process all configured submodules
process_all_submodules() {
  log "info" "Processing ${#SUBMODULES[@]} submodule(s)..."

  for submodule_config in "${SUBMODULES[@]}"; do
    # Parse configuration
    IFS='|' read -r name path branch build_commands build_output lfs <<< "$submodule_config"

    echo ""
    log "info" "━━━ Processing: $name ━━━"

    # Sync the submodule
    sync_submodule "$name" "$path" "$branch" "$lfs"

    # Build if not skipped
    if [ "$SKIP_BUILD" = false ]; then
      build_submodule "$name" "$path" "$build_commands" "$build_output"
    fi
  done
}

# Main execution
main() {
  # Check if git is available
  if ! command_exists git; then
    log "error" "Git is not installed or not in PATH"
    exit 1
  fi

  # Check if we're in a git repository
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log "error" "Not in a git repository"
    exit 1
  fi

  log "info" "Starting submodule sync..."

  initialize_submodules
  process_all_submodules
  check_changes

  echo ""
  log "success" "All submodules synced successfully!"
}

# Help function
show_help() {
  cat << EOF
Git Submodule Sync - Cross-Platform Version

Synchronizes git submodules for any project type.

USAGE:
  ./sync-submodules.sh [options]

ENVIRONMENT VARIABLES:
  SUBMODULE_BRANCH    Branch to use for submodules (default: app/docs)

OPTIONS:
  -h, --help          Show this help message
  --no-build          Skip the build step
  --branch BRANCH     Override submodule branch

EXAMPLES:
  ./sync-submodules.sh
  SUBMODULE_BRANCH=main ./sync-submodules.sh
  ./sync-submodules.sh --no-build

EOF
}

# Parse arguments
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    --no-build)
      SKIP_BUILD=true
      shift
      ;;
    --branch)
      SUBMODULE_BRANCH="$2"
      shift 2
      ;;
    *)
      log "error" "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Run main function
main
