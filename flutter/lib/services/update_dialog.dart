import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/update_info.dart';

class UpdateDialog {
  /// Track if an update dialog is currently visible to avoid stacking multiple dialogs
  static bool isDialogShowing = false;

  /// Single unified redirect to website download page across ALL platforms (Android, Windows, macOS).
  /// The website handles platform-detection and GitHub Releases download links.
  static Future<void> openDownloadPage() async {
    final uri = Uri.parse('https://genmusics.vercel.app/download');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  /// Compares semantic versions (e.g., "2.5.0" vs "1.0.0").
  /// Returns 1 if v1 > v2, -1 if v1 < v2, and 0 if equal.
  static int compareSemver(String v1, String v2) {
    String clean(String v) => v.toLowerCase().replaceAll(RegExp(r'[^0-9.]'), '');
    final p1 = clean(v1).split('.').map((e) => int.tryParse(e) ?? 0).toList();
    final p2 = clean(v2).split('.').map((e) => int.tryParse(e) ?? 0).toList();
    final len = p1.length > p2.length ? p1.length : p2.length;

    for (int i = 0; i < len; i++) {
      final a = i < p1.length ? p1[i] : 0;
      final b = i < p2.length ? p2[i] : 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  /// Shared "What's New" update dialog used by both the launch-time check
  /// and the realtime Pusher update listener.
  static Future<void> show({
    required BuildContext context,
    required UpdateInfo updateInfo,
    required String currentVersion,
  }) async {
    // Avoid duplicate dialogs if already visible
    if (isDialogShowing) return;

    final isBelowMin = compareSemver(currentVersion, updateInfo.minSupportedVersion) < 0;
    final isMandatory = updateInfo.forceUpdate || isBelowMin;

    isDialogShowing = true;

    try {
      await showDialog<void>(
        context: context,
        barrierDismissible: !isMandatory,
        builder: (BuildContext dialogContext) {
          return PopScope(
            // Block system back button on Android/desktop if mandatory
            canPop: !isMandatory,
            child: AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
              contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isMandatory 
                        ? Colors.red.withOpacity(0.12) 
                        : Colors.blue.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isMandatory ? Icons.warning_amber_rounded : Icons.rocket_launch_rounded,
                      color: isMandatory ? Colors.red : Colors.blue,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isMandatory ? 'Required Update' : 'What\'s New',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'v$currentVersion → v${updateInfo.latestVersion}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isMandatory)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'This update includes critical improvements. You must update to continue using GEN MUSIC.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.red.shade700,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  const Text(
                    'Release Highlights:',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Flexible(
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 220),
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: updateInfo.whatsNew.isNotEmpty
                              ? updateInfo.whatsNew.map((note) {
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 4),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Icon(
                                          Icons.check_circle_outline,
                                          color: Colors.green,
                                          size: 18,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            note,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              height: 1.4,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList()
                              : [
                                  const Text(
                                    '• Performance optimizations & stability improvements',
                                    style: TextStyle(fontSize: 13),
                                  ),
                                ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Tapping "Update Now" will open the official GEN MUSIC download page in your browser.',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
              actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              actions: [
                if (!isMandatory)
                  TextButton(
                    onPressed: () {
                      Navigator.of(dialogContext).pop();
                    },
                    child: const Text('Later'),
                  ),
                FilledButton.icon(
                  onPressed: () async {
                    if (!isMandatory) {
                      Navigator.of(dialogContext).pop();
                    }
                    await openDownloadPage();
                  },
                  icon: const Icon(Icons.download_rounded, size: 18),
                  label: const Text('Update Now'),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      );
    } finally {
      isDialogShowing = false;
    }
  }
}
