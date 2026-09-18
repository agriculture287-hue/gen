import 'dart:convert';

/// Model representing application update metadata received from
/// `https://genmusics.vercel.app/app-version.json` or the Pusher `app-update` event.
class UpdateInfo {
  final String latestVersion;
  final String minSupportedVersion;
  final bool forceUpdate;
  final List<String> whatsNew;
  final Map<String, String>? downloadUrls;

  const UpdateInfo({
    required this.latestVersion,
    required this.minSupportedVersion,
    required this.forceUpdate,
    required this.whatsNew,
    this.downloadUrls,
  });

  factory UpdateInfo.fromJson(Map<String, dynamic> json) {
    // Parse whats_new (handles List of strings or string with newlines)
    List<String> notes = [];
    final rawNotes = json['whats_new'] ?? json['whatsNew'] ?? json['release_notes'] ?? json['releaseNotes'];
    if (rawNotes is List) {
      notes = rawNotes.map((e) => e.toString()).toList();
    } else if (rawNotes is String && rawNotes.isNotEmpty) {
      notes = rawNotes.split('\n').where((s) => s.trim().isNotEmpty).toList();
    }

    // Parse download URLs if provided
    Map<String, String>? urls;
    final rawUrls = json['download_url'] ?? json['downloadUrls'] ?? json['download_urls'];
    if (rawUrls is Map) {
      urls = rawUrls.map((key, value) => MapEntry(key.toString(), value.toString()));
    }

    return UpdateInfo(
      latestVersion: (json['latest_version'] ?? json['latestVersion'] ?? json['version'] ?? '1.0.0').toString(),
      minSupportedVersion: (json['min_supported_version'] ?? json['minSupportedVersion'] ?? json['minimumVersion'] ?? '1.0.0').toString(),
      forceUpdate: json['force_update'] == true || json['forceUpdate'] == true || json['isMandatory'] == true,
      whatsNew: notes,
      downloadUrls: urls,
    );
  }

  factory UpdateInfo.fromRawJson(String str) {
    final decoded = json.decode(str);
    if (decoded is Map<String, dynamic>) {
      return UpdateInfo.fromJson(decoded);
    }
    throw const FormatException('Expected JSON object for UpdateInfo');
  }

  Map<String, dynamic> toJson() => {
    'latest_version': latestVersion,
    'min_supported_version': minSupportedVersion,
    'force_update': forceUpdate,
    'whats_new': whatsNew,
    if (downloadUrls != null) 'download_url': downloadUrls,
  };
}
