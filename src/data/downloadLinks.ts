/**
 * GEN MUSIC - Centralized Download Links & Version Configuration
 * 
 * Edit this file directly to update download links, file sizes, or version numbers.
 * No databases, Vercel Blob, or admin panel required.
 */

export const DOWNLOAD_LINKS = {
  // Current release version displayed to users
  version: "v2.0.4",
  
  // Last updated release date info
  releaseDate: "September 2026",

  // Android Configuration (.apk)
  android: {
    downloadUrl: "https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music.apk",
    fileSize: "24.8 MB",
    minSystem: "Android 8.0 or later (Oreo to Android 15+)",
    architecture: "ARM64-v8a & Universal (All Devices)",
  },

  // Android Car/Auto Configuration (.apk)
  androidCar: {
    downloadUrl: "https://github.com/agriculture287-hue/gen/releases/download/Car_Android/GEN-Music-Car.apk",
    fileSize: "26.1 MB",
    minSystem: "Android Auto / Android Automotive OS 8.0+",
    architecture: "ARM64 & ARMv7 Universal",
  },

  // Windows Configuration (.exe)
  windows: {
    downloadUrl: "https://github.com/agriculture287-hue/gen/releases/download/Win/Gen-Music.exe",
    fileSize: "56.2 MB",
    minSystem: "Windows 10 / 11 (64-bit architecture)",
    architecture: "x64 & ARM64 Architecture",
  },

  // macOS Configuration (.dmg)
  macos: {
    downloadUrl: "https://github.com/agriculture287-hue/gen/releases/download/mac/Gen-Music.dmg",
    fileSize: "68.4 MB",
    minSystem: "macOS 12.0 Monterey or later (Apple Silicon & Intel)",
    architecture: "Universal (Apple Silicon + Intel x86_64)",
  }
};
