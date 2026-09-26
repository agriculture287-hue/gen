import { Track, RepeatMode } from '../types/music';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerStateListener = (state: {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  currentTrack: Track | null;
}) => void;

class AudioPlayerService {
  private ytPlayer: any = null;
  private isApiReady: boolean = false;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private isBuffering: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 100;
  private isMuted: boolean = false;
  private timeUpdateInterval: any = null;
  private listeners: Set<PlayerStateListener> = new Set();
  private onTrackEndCallback: (() => void) | null = null;
  private isInitializing: boolean = false;

  constructor() {
    this.initYouTubeAPI();
    this.setupMediaSession();
  }

  private initYouTubeAPI() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.isApiReady = true;
      this.createPlayer();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      this.isApiReady = true;
      this.createPlayer();
    };

    // Fallback polling in case the script was already loaded
    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkInterval);
        this.isApiReady = true;
        this.createPlayer();
      }
    }, 500);

    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  private createPlayer() {
    if (!this.isApiReady || this.ytPlayer || this.isInitializing || typeof window === 'undefined') return;

    const container = document.getElementById('gen-music-audio-bridge');
    if (!container) return;

    this.isInitializing = true;
    try {
      this.ytPlayer = new window.YT.Player('gen-music-audio-bridge', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isInitializing = false;
            this.ytPlayer.setVolume(this.volume);
            if (this.currentTrack) {
              this.loadTrack(this.currentTrack, true);
            }
          },
          onStateChange: (event: any) => {
            this.handleStateChange(event.data);
          },
          onError: (event: any) => {
            console.warn('YouTube Player Audio Bridge event code:', event.data);
            this.isBuffering = false;
            this.notify();
          }
        }
      });
    } catch (e) {
      console.warn('Error instantiating YT Player:', e);
      this.isInitializing = false;
    }
  }

  private handleStateChange(state: number) {
    // YT.PlayerState: -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
    if (state === 1) { // PLAYING
      this.isPlaying = true;
      this.isBuffering = false;
      this.startTimeTracker();
      if (this.ytPlayer?.getDuration) {
        const d = this.ytPlayer.getDuration();
        if (d > 0) this.duration = d;
      }
      this.updateMediaSessionState('playing');
    } else if (state === 2) { // PAUSED
      this.isPlaying = false;
      this.isBuffering = false;
      this.stopTimeTracker();
      this.updateMediaSessionState('paused');
    } else if (state === 3) { // BUFFERING
      this.isBuffering = true;
    } else if (state === 0) { // ENDED
      this.isPlaying = false;
      this.isBuffering = false;
      this.currentTime = this.duration;
      this.stopTimeTracker();
      if (this.onTrackEndCallback) {
        this.onTrackEndCallback();
      }
    }
    this.notify();
  }

  private startTimeTracker() {
    this.stopTimeTracker();
    this.timeUpdateInterval = setInterval(() => {
      if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        const cur = this.ytPlayer.getCurrentTime() || 0;
        const dur = this.ytPlayer.getDuration() || this.duration;
        this.currentTime = cur;
        if (dur > 0) this.duration = dur;
        this.notify();
        this.updateMediaSessionPosition();
      }
    }, 250);
  }

  private stopTimeTracker() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  public subscribe(listener: PlayerStateListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener({
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      currentTime: this.currentTime,
      duration: this.duration,
      currentTrack: this.currentTrack
    });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = {
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      currentTime: this.currentTime,
      duration: this.duration,
      currentTrack: this.currentTrack
    };
    this.listeners.forEach((listener) => listener(state));
  }

  public setOnTrackEnd(cb: () => void) {
    this.onTrackEndCallback = cb;
  }

  public loadTrack(track: Track, autoPlay: boolean = true) {
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.durationSeconds || 0;
    this.isBuffering = true;
    this.notify();

    if (!this.ytPlayer) {
      this.createPlayer();
    }

    if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        if (autoPlay) {
          this.ytPlayer.loadVideoById(track.id);
          this.isPlaying = true;
        } else {
          this.ytPlayer.cueVideoById(track.id);
          this.isPlaying = false;
        }
      } catch (err) {
        console.warn('Playback load exception:', err);
      }
    }

    this.updateMediaSessionMetadata(track);
  }

  public play() {
    if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      this.ytPlayer.playVideo();
      this.isPlaying = true;
      this.notify();
    }
  }

  public pause() {
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
      this.isPlaying = false;
      this.notify();
    }
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seekTo(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.duration || 99999));
    this.currentTime = clamped;
    if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      this.ytPlayer.seekTo(clamped, true);
    }
    this.notify();
    this.updateMediaSessionPosition();
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(volume, 100));
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(this.volume);
    }
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
      if (this.ytPlayer && typeof this.ytPlayer.unMute === 'function') {
        this.ytPlayer.unMute();
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ytPlayer) {
      if (this.isMuted) {
        this.ytPlayer.mute?.();
      } else {
        this.ytPlayer.unMute?.();
      }
    }
    return this.isMuted;
  }

  // Media Session API Integration for PWA / Lock Screen controls
  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seekTo(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seekTo(this.currentTime - offset);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seekTo(this.currentTime + offset);
      });
      navigator.mediaSession.setActionHandler('stop', () => this.pause());
    } catch (e) {
      console.warn('MediaSession handler configuration warning:', e);
    }
  }

  public setMediaSessionNavHandlers(onPrev: () => void, onNext: () => void) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('previoustrack', onPrev);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    } catch (e) {}
  }

  private updateMediaSessionMetadata(track: Track) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !window.MediaMetadata) return;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Gen Music',
        artwork: [
          { src: track.thumbnail || '/pwa-512x512.png', sizes: '512x512', type: 'image/jpeg' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    } catch (e) {
      console.warn('Failed setting MediaMetadata:', e);
    }
  }

  private updateMediaSessionState(state: 'playing' | 'paused') {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {}
  }

  private updateMediaSessionPosition() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      if (this.duration > 0 && this.currentTime <= this.duration) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: 1,
          position: Math.max(0, this.currentTime)
        });
      }
    } catch (e) {}
  }
}

export const audioPlayer = new AudioPlayerService();
