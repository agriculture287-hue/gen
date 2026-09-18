import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/update_info.dart';
import 'update_dialog.dart';

class UpdateCheckerService {
  static const String versionEndpoint = 'https://genmusics.vercel.app/app-version.json';

  /// Single unified redirect to website download page across ALL platforms (Android, Windows, macOS).
  /// Replaces all legacy per-platform download/install logic.
  static Future<void> openDownloadPage() async {
    final uri = Uri.parse('https://genmusics.vercel.app/download');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  /// Checks for application updates on launch.
  /// If a newer version or mandatory update is detected, shows the shared "What's New" dialog.
  static Future<void> checkOnLaunch(BuildContext context) async {
    try {
      final response = await http.get(
        Uri.parse(versionEndpoint),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) {
        debugPrint('[UpdateCheckerService] Server returned status: ${response.statusCode}');
        return;
      }

      final Map<String, dynamic> data = json.decode(response.body);
      final updateInfo = UpdateInfo.fromJson(data);

      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      final hasNewerVersion = UpdateDialog.compareSemver(updateInfo.latestVersion, currentVersion) > 0;
      final isBelowMin = UpdateDialog.compareSemver(currentVersion, updateInfo.minSupportedVersion) < 0;

      if (hasNewerVersion || updateInfo.forceUpdate || isBelowMin) {
        if (context.mounted) {
          await UpdateDialog.show(
            context: context,
            updateInfo: updateInfo,
            currentVersion: currentVersion,
          );
        }
      }
    } catch (e) {
      debugPrint('[UpdateCheckerService] Failed to check for updates: $e');
    }
  }
}
