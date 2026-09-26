import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GEN MUSIC Caught Unhandled React Error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear any potentially corrupted state or caches
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080e] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0d1020] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We encountered an issue loading the interface. You can reload the page or return to the main landing page.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-lg bg-black/40 border border-red-500/20 text-xs font-mono text-red-300 text-left overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Home className="w-4 h-4" />
                <span>Reset to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
