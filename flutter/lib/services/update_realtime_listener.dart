import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import '../models/update_info.dart';
import 'update_dialog.dart';

class UpdateRealtimeListener {
  final String apiKey;
  final String cluster;
  final GlobalKey<NavigatorState> navigatorKey;

  static const String channelName = 'genmusic-updates';
  static const String eventName = 'app-update';

  final PusherChannelsFlutter _pusher = PusherChannelsFlutter.getInstance();
  bool _isInitialized = false;

  /// Creates a realtime update listener for GEN MUSIC.
  /// 
  /// [apiKey] and [cluster] are your Pusher application credentials.
  /// [navigatorKey] is used to present the dialog over the active app screen.
  UpdateRealtimeListener({
    required this.apiKey,
    required this.cluster,
    required this.navigatorKey,
  });

  /// Initializes the Pusher connection and subscribes to the `genmusic-updates` channel.
  Future<void> init() async {
    if (_isInitialized) return;

    try {
      await _pusher.init(
        apiKey: apiKey,
        cluster: cluster,
        onEvent: _handlePusherEvent,
        onConnectionStateChange: (currentState, previousState) {
          debugPrint('[UpdateRealtimeListener] Connection state: $previousState -> $currentState');
        },
        onError: (message, code, error) {
          debugPrint('[UpdateRealtimeListener] Pusher error: $message (code: $code, error: $error)');
        },
        onSubscriptionSucceeded: (channel, data) {
          debugPrint('[UpdateRealtimeListener] Subscribed successfully to channel: $channel');
        },
      );

      await _pusher.subscribe(channelName: channelName);
      await _pusher.connect();
      _isInitialized = true;
      debugPrint('[UpdateRealtimeListener] Realtime update listener started on $channelName');
    } catch (e) {
      debugPrint('[UpdateRealtimeListener] Failed to initialize Pusher: $e');
    }
  }

  /// Handles incoming Pusher events and parses `app-update` notifications.
  void _handlePusherEvent(PusherEvent event) async {
    if (event.channelName != channelName || event.eventName != eventName) {
      return;
    }

    debugPrint('[UpdateRealtimeListener] Received "$eventName" event: ${event.data}');

    try {
      dynamic rawData = event.data;
      Map<String, dynamic> payload;

      if (rawData is String) {
        payload = json.decode(rawData) as Map<String, dynamic>;
      } else if (rawData is Map<String, dynamic>) {
        payload = rawData;
      } else {
        debugPrint('[UpdateRealtimeListener] Unexpected payload format: $rawData');
        return;
      }

      final updateInfo = UpdateInfo.fromJson(payload);
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      final hasNewerVersion = UpdateDialog.compareSemver(updateInfo.latestVersion, currentVersion) > 0;
      final isBelowMin = UpdateDialog.compareSemver(currentVersion, updateInfo.minSupportedVersion) < 0;

      if (hasNewerVersion || updateInfo.forceUpdate || isBelowMin) {
        final context = navigatorKey.currentContext;
        if (context != null && context.mounted) {
          await UpdateDialog.show(
            context: context,
            updateInfo: updateInfo,
            currentVersion: currentVersion,
          );
        }
      }
    } catch (e) {
      debugPrint('[UpdateRealtimeListener] Error handling update payload: $e');
    }
  }

  /// Disconnects from Pusher and cleans up resources.
  Future<void> dispose() async {
    try {
      await _pusher.unsubscribe(channelName: channelName);
      await _pusher.disconnect();
      _isInitialized = false;
    } catch (e) {
      debugPrint('[UpdateRealtimeListener] Error disconnecting Pusher: $e');
    }
  }
}
