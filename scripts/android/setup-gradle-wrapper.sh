#!/usr/bin/env bash
set -euo pipefail

GRADLE_VERSION=${GRADLE_VERSION:-8.2.2}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANDROID_DIR="$ROOT_DIR/apps/android"

TMP_DIR="$(mktemp -d)"
ZIP="$TMP_DIR/gradle-$GRADLE_VERSION-bin.zip"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to download Gradle." >&2
  exit 1
fi

curl -L "https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip" -o "$ZIP"
if ! command -v unzip >/dev/null 2>&1; then
  echo "unzip is required to extract Gradle." >&2
  exit 1
fi

unzip -q "$ZIP" -d "$TMP_DIR"
"$TMP_DIR/gradle-$GRADLE_VERSION/bin/gradle" -p "$ANDROID_DIR" wrapper --gradle-version "$GRADLE_VERSION"

echo "Gradle wrapper generated for $ANDROID_DIR (version $GRADLE_VERSION)"
