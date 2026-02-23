#!/usr/bin/env bash
set -euo pipefail

OS_NAME="$(uname -s)"
case "$OS_NAME" in
  Darwin) TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip" ;;
  Linux) TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" ;;
  *) echo "Unsupported OS: $OS_NAME" >&2; exit 1 ;;
esac

ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-"$HOME/Library/Android/sdk"}
CMDLINE_DIR="$ANDROID_SDK_ROOT/cmdline-tools/latest"
TMP_DIR="$(mktemp -d)"
ZIP="$TMP_DIR/cmdline-tools.zip"

mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to download Android command-line tools." >&2
  exit 1
fi

curl -L "$TOOLS_URL" -o "$ZIP"
if ! command -v unzip >/dev/null 2>&1; then
  echo "unzip is required to extract Android command-line tools." >&2
  exit 1
fi

unzip -q "$ZIP" -d "$TMP_DIR"
rm -rf "$CMDLINE_DIR"
mkdir -p "$CMDLINE_DIR"

# The zip extracts into a top-level 'cmdline-tools' directory
mv "$TMP_DIR/cmdline-tools"/* "$CMDLINE_DIR"

export PATH="$CMDLINE_DIR/bin:$PATH"

sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"

echo "Android SDK installed at $ANDROID_SDK_ROOT"
