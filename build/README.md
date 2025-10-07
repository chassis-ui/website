# Chassis Assets Sync - Multi-Platform

This directory contains tools to synchronize chassis-assets submodule across different project types and environments.

## 🚀 Quick Start

### For Any Project Type
```bash
# Clone your project and initialize submodules
git clone your-project
cd your-project
git submodule update --init --recursive

# Run the appropriate sync tool for your environment
```

## 🛠️ Available Tools

### 1. JavaScript/Node.js Projects (`sync-submodules.js`)
**Best for**: Node.js, Astro, Next.js, React, Vue projects

```bash
# Install dependencies first
npm install  # or pnpm install, yarn install

# Sync submodules
node build/sync-submodules.js

# With custom branch
SUBMODULE_BRANCH=main node build/sync-submodules.js
```

### 2. Shell Script (`sync-submodules.sh`)
**Best for**: Any environment, CI/CD, cross-platform projects

```bash
# Make executable (first time only)
chmod +x build/sync-submodules.sh

# Sync submodules
./build/sync-submodules.sh

# With custom branch
SUBMODULE_BRANCH=main ./build/sync-submodules.sh

# Skip build step
./build/sync-submodules.sh --no-build
```

### 3. Makefile (`Makefile`)
**Best for**: Linux/Unix environments, development workflows

```bash
# Sync and build
make sync

# Sync only (no build)
make sync-only

# Build only
make build

# With custom branch
make sync SUBMODULE_BRANCH=main

# Platform-specific builds
make build-node      # Node.js projects
make build-android   # Android projects
make build-ios       # iOS/macOS projects
make build-flutter   # Flutter projects
```

## 🎯 Project Type Detection

The tools automatically detect your project type and run appropriate build commands:

| Project Type | Detection | Build Command |
|-------------|-----------|---------------|
| **Node.js** | `package.json` | `pnpm install && pnpm build` |
| **Android** | `build.gradle` | `./gradlew build` |
| **iOS/macOS** | `Package.swift` or `.xcodeproj` | `swift build` or `xcodebuild` |
| **Flutter** | `pubspec.yaml` | `flutter pub get && flutter build` |
| **React Native** | `package.json` + react-native | `npm install && npm run build` |

## 🔧 Configuration

### Environment Variables
```bash
SUBMODULE_BRANCH=main     # Branch to sync (default: app/docs)
```

### Manual Configuration
Edit the submodule configuration in the tool files to customize:
- Submodule paths
- Build commands
- Branch names

## 📋 CI/CD Integration

### GitHub Actions
```yaml
- name: Sync Chassis Assets
  run: ./build/sync-submodules.sh --no-build
```

### GitLab CI
```yaml
sync_assets:
  script:
    - chmod +x build/sync-submodules.sh
    - ./build/sync-submodules.sh --no-build
```

### Jenkins
```groovy
sh 'chmod +x build/sync-submodules.sh && ./build/sync-submodules.sh --no-build'
```

## 🏗️ Architecture

```
build/
├── sync-submodules.js    # Node.js version (full features)
├── sync-submodules.sh    # Shell version (cross-platform)
├── Makefile             # Make version (Unix/Linux)
└── README.md            # This documentation
```

## 🔄 Migration Guide

### From Node.js only to Multi-platform

1. **Keep using JavaScript** if your project already uses Node.js
2. **Switch to Shell** for broader platform support
3. **Use Makefile** for development workflows on Unix systems

### Adding New Project Types

1. Update project detection logic in your chosen tool
2. Add appropriate build commands
3. Test across target platforms

## 🐛 Troubleshooting

### Common Issues

**"Git not found"**
- Ensure Git is installed and in PATH
- On Windows, use Git Bash or WSL

**"Permission denied"**
```bash
chmod +x build/sync-submodules.sh
```

**"Submodule path not found"**
```bash
git submodule update --init --recursive
```

**Build failures**
- Check that required build tools are installed
- Verify project structure matches expectations

### Debug Mode
```bash
# Shell script with verbose output
bash -x ./build/sync-submodules.sh

# Makefile with verbose output
make sync V=1
```

## 📈 Performance

| Tool | Startup | Cross-platform | Dependencies |
|------|---------|----------------|--------------|
| **JavaScript** | Fast | Good | Node.js |
| **Shell** | Fastest | Excellent | Bash |
| **Makefile** | Fast | Good (Unix) | Make |

## 🤝 Contributing

When adding support for new project types:

1. Update detection logic
2. Add build commands
3. Test on target platforms
4. Update documentation

---

**Choose the tool that best fits your project's needs and environment!** 🎯
