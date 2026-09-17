import 'package:flutter/material.dart';
import 'services/update_checker_service.dart';
import 'services/update_realtime_listener.dart';

// Global navigator key used by UpdateRealtimeListener to show the dialog anywhere in the app
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GenMusicApp());
}

class GenMusicApp extends StatefulWidget {
  const GenMusicApp({super.key});

  @override
  State<GenMusicApp> createState() => _GenMusicAppState();
}

class _GenMusicAppState extends State<GenMusicApp> {
  late final UpdateRealtimeListener _realtimeListener;

  @override
  void initState() {
    super.initState();

    // 1. Initialize Realtime Pusher Listener (stays active for the app's lifetime)
    _realtimeListener = UpdateRealtimeListener(
      apiKey: 'YOUR_PUSHER_KEY',         // Replace with your real Pusher key
      cluster: 'YOUR_PUSHER_CLUSTER',     // e.g. "eu", "us2", "ap2"
      navigatorKey: navigatorKey,
    );
    _realtimeListener.init();

    // 2. Perform Launch-Time Check after first frame renders
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (navigatorKey.currentContext != null) {
        UpdateCheckerService.checkOnLaunch(navigatorKey.currentContext!);
      }
    });
  }

  @override
  void dispose() {
    _realtimeListener.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GEN MUSIC',
      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GEN MUSIC'),
        actions: [
          IconButton(
            tooltip: 'Check for Updates',
            icon: const Icon(Icons.system_update_alt_rounded),
            onPressed: () => UpdateCheckerService.checkOnLaunch(context),
          ),
        ],
      ),
      body: const Center(
        child: Text(
          'Music For Every Mood\nListening for realtime updates...',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16),
        ),
      ),
    );
  }
}
