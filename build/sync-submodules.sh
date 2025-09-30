#!/bin/bash

# Git Submodule Sync - Cross-Platform Shell Version
# Synchronizes chassis-assets submodule for any project type

set -e  # Exit on any error

# Configuration
SUBMODULE_BRANCH="${SUBMODULE_BRANCH:-app/docs}"
SUBMODULE_PATH="vendor/assets"
SUBMODULE_NAME="chassis-assets"

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

# Main sync function
sync_submodule() {
  log "info" "Syncing $SUBMODULE_NAME..."

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

  # Initialize and update submodule
  if [ ! -d "$SUBMODULE_PATH" ]; then
    log "info" "Initializing submodule..."
    git submodule add -b "$SUBMODULE_BRANCH" https://github.com/ozgurgunes/chassis-assets.git "$SUBMODULE_PATH" 2>/dev/null || true
  fi

  git submodule update --init --remote "$SUBMODULE_PATH"

  # Switch to correct branch if needed
  local current_branch
  current_branch=$(git -C "$SUBMODULE_PATH" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

  if [ "$current_branch" != "$SUBMODULE_BRANCH" ]; then
    log "info" "Switching $SUBMODULE_NAME to $SUBMODULE_BRANCH branch..."
    git -C "$SUBMODULE_PATH" checkout "$SUBMODULE_BRANCH"
    git -C "$SUBMODULE_PATH" pull origin "$SUBMODULE_BRANCH"
  fi

  log "success" "$SUBMODULE_NAME synced successfully"
}

# Detect project type and run appropriate build
detect_and_build() {
  local project_type="unknown"

  # iOS/macOS project detection
  if [ -f "Package.swift" ] || [ -d "*.xcodeproj" ] || [ -f "*.xcworkspace" ]; then
    project_type="swift"
    log "info" "Detected Swift/iOS project"

  # Android project detection
  elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ] || [ -d "app/src" ]; then
    project_type="android"
    log "info" "Detected Android project"

  # React Native detection
  elif [ -f "package.json" ] && grep -q "react-native" package.json 2>/dev/null; then
    project_type="react-native"
    log "info" "Detected React Native project"

  # Flutter detection
  elif [ -f "pubspec.yaml" ] && grep -q "flutter" pubspec.yaml 2>/dev/null; then
    project_type="flutter"
    log "info" "Detected Flutter project"

  # Node.js project detection
  elif [ -f "package.json" ]; then
    project_type="node"
    log "info" "Detected Node.js project"
  fi

  # Build based on project type
  case $project_type in
    "node")
      if command_exists pnpm; then
        log "info" "Building with pnpm..."
        (cd "$SUBMODULE_PATH" && pnpm install && pnpm build)
      elif command_exists npm; then
        log "info" "Building with npm..."
        (cd "$SUBMODULE_PATH" && npm install && npm run build)
      else
        log "warning" "No package manager found, skipping build"
      fi
      ;;

    "android")
      if command_exists ./gradlew; then
        log "info" "Building Android project..."
        ./gradlew build
      else
        log "warning" "Gradle wrapper not found"
      fi
      ;;

    "swift")
      if command_exists swift; then
        log "info" "Building Swift project..."
        swift build
      elif command_exists xcodebuild; then
        log "info" "Building with xcodebuild..."
        xcodebuild -scheme YourScheme build
      else
        log "warning" "No Swift build tools found"
      fi
      ;;

    "flutter")
      if command_exists flutter; then
        log "info" "Building Flutter project..."
        flutter pub get
        flutter build
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

# Main execution
main() {
  log "info" "Starting submodule sync..."

  sync_submodule
  detect_and_build
  check_changes

  log "success" "Submodule sync completed!"
}

# Help function
show_help() {
  cat << EOF
Git Submodule Sync - Cross-Platform Version

Synchronizes chassis-assets submodule for any project type.

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
