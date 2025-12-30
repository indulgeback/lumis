# Build Resources

This directory contains resources needed for building and packaging the application.

## Required Files

### Icons
- `icon.icns` - macOS icon (required for DMG builds)
- `icon.ico` - Windows icon (required for NSIS builds)
- `icon.png` - Linux icon (required for AppImage/deb/rpm builds, recommended size: 512x512px)

### Other Files
- `entitlements.mac.plist` - macOS code signing entitlements

## Generating Icons

You can use tools like [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder) to generate icons from a single PNG source:

```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./source-icon.png --output=./build --flatten
```

Source image should be at least 1024x1024px with transparent background.
