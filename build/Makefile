# Chassis Assets Sync - Multi-Platform Makefile
# Usage: make sync SUBMODULE_BRANCH=main

.PHONY: help sync sync-only build build-node build-android build-ios build-flutter clean

# Default branch
SUBMODULE_BRANCH ?= app/docs
SUBMODULE_PATH = vendor/assets

# Detect OS
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname -s)
endif

# Colors (if supported)
ifneq ($(TERM),dumb)
    GREEN := \033[0;32m
    BLUE := \033[0;34m
    YELLOW := \033[1;33m
    RED := \033[0;31m
    NC := \033[0m
endif

# Logging
define log
@echo "$(BLUE)[INFO]$(NC) $(1)"
endef

define success
@echo "$(GREEN)[SUCCESS]$(NC) $(1)"
endef

define warning
@echo "$(YELLOW)[WARNING]$(NC) $(1)"
endef

define error
@echo "$(RED)[ERROR]$(NC) $(1)"
endef

help:
	@echo "Chassis Assets Sync - Multi-Platform Makefile"
	@echo ""
	@echo "USAGE:"
	@echo "  make sync                    # Sync and build"
	@echo "  make sync-only               # Sync only (no build)"
	@echo "  make build                   # Build only"
	@echo "  make build-node              # Build for Node.js"
	@echo "  make build-android           # Build for Android"
	@echo "  make build-ios               # Build for iOS"
	@echo "  make build-flutter           # Build for Flutter"
	@echo ""
	@echo "ENVIRONMENT VARIABLES:"
	@echo "  SUBMODULE_BRANCH=main        # Override default branch"
	@echo ""
	@echo "EXAMPLES:"
	@echo "  make sync"
	@echo "  make sync SUBMODULE_BRANCH=main"
	@echo "  make build-node"

sync: sync-only build

sync-only:
	$(call log,Syncing chassis-assets submodule...)
	@if [ ! -d "$(SUBMODULE_PATH)" ]; then \
		git submodule add -b $(SUBMODULE_BRANCH) https://github.com/ozgurgunes/chassis-assets.git $(SUBMODULE_PATH) 2>/dev/null || true; \
	fi
	git submodule update --init --remote $(SUBMODULE_PATH)
	@CURRENT_BRANCH=$$(git -C $(SUBMODULE_PATH) rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""); \
	if [ "$$CURRENT_BRANCH" != "$(SUBMODULE_BRANCH)" ]; then \
		$(call log,Switching to $(SUBMODULE_BRANCH) branch...); \
		git -C $(SUBMODULE_PATH) checkout $(SUBMODULE_BRANCH); \
		git -C $(SUBMODULE_PATH) pull origin $(SUBMODULE_BRANCH); \
	fi
	$(call success,chassis-assets synced successfully)

build:
	$(call log,Detecting project type...)
	@if [ -f "package.json" ] && grep -q "react-native" package.json 2>/dev/null; then \
		$(MAKE) build-react-native; \
	elif [ -f "pubspec.yaml" ] && grep -q "flutter" pubspec.yaml 2>/dev/null; then \
		$(MAKE) build-flutter; \
	elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then \
		$(MAKE) build-android; \
	elif [ -f "Package.swift" ] || [ -d "*.xcodeproj" ]; then \
		$(MAKE) build-ios; \
	elif [ -f "package.json" ]; then \
		$(MAKE) build-node; \
	else \
		$(call warning,Unknown project type, skipping build); \
	fi

build-node:
	$(call log,Building Node.js project...)
	@if command -v pnpm >/dev/null 2>&1; then \
		(cd $(SUBMODULE_PATH) && pnpm install && pnpm build); \
	elif command -v npm >/dev/null 2>&1; then \
		(cd $(SUBMODULE_PATH) && npm install && npm run build); \
	else \
		$(call error,No package manager found); \
		exit 1; \
	fi
	$(call success,Node.js build completed)

build-android:
	$(call log,Building Android project...)
	@if [ -f "./gradlew" ]; then \
		./gradlew build; \
	else \
		$(call error,Gradle wrapper not found); \
		exit 1; \
	fi
	$(call success,Android build completed)

build-ios:
	$(call log,Building iOS project...)
	@if command -v swift >/dev/null 2>&1; then \
		swift build; \
	elif command -v xcodebuild >/dev/null 2>&1; then \
		xcodebuild -scheme $$(basename *.xcodeproj .xcodeproj) build; \
	else \
		$(call error,No iOS build tools found); \
		exit 1; \
	fi
	$(call success,iOS build completed)

build-flutter:
	$(call log,Building Flutter project...)
	@if command -v flutter >/dev/null 2>&1; then \
		flutter pub get; \
		flutter build; \
	else \
		$(call error,Flutter not found); \
		exit 1; \
	fi
	$(call success,Flutter build completed)

build-react-native:
	$(call log,Building React Native project...)
	@if [ -f "package.json" ]; then \
		if command -v yarn >/dev/null 2>&1; then \
			yarn install && yarn run build; \
		elif command -v npm >/dev/null 2>&1; then \
			npm install && npm run build; \
		fi; \
	fi
	$(call success,React Native build completed)

clean:
	$(call log,Cleaning build artifacts...)
	rm -rf $(SUBMODULE_PATH)/node_modules
	rm -rf $(SUBMODULE_PATH)/dist
	$(call success,Clean completed)

# CI/CD targets
ci-sync:
	$(call log,CI: Syncing submodules...)
	git submodule update --init --recursive
	$(call success,CI: Submodules synced)

ci-build:
	$(call log,CI: Building project...)
	$(MAKE) build
	$(call success,CI: Build completed)
