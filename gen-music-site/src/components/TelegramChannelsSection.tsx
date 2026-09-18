import React from 'react';
import { 
  Send, 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  Bell, 
  DownloadCloud, 
  CheckCircle2, 
  Edit3
} from 'lucide-react';
import { TelegramChannel, TelegramConfig } from '../types';

interface TelegramChannelsSectionProps {
  telegramConfig: TelegramConfig;
  channels: TelegramChannel[];
  isAdminLoggedIn?: boolean;
  onOpenAdmin?: () => void;
}

export const TelegramChannelsSection: React.FC<TelegramChannelsSectionProps> = ({
  telegramConfig,
  channels,
}) => {
  return (
    <section 
      id="channels" 
      aria-label="Telegram Channels & Community"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Send className="w-3.5 h-3.5" />
          <span>Official Telegram Community</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Join Official{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Telegram Channels
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          Get direct APK download links, instant release announcements, experimental beta testing builds, and 24/7 admin assistance.
        </p>
      </div>

      {/* Admin Direct Contact Highlight Banner */}
      <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft background decor */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-5 z-10 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
            <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                Direct Admin Contact on Telegram
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                {telegramConfig.contactUsername}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              {telegramConfig.announcementText || 'Need direct APK links, help with installation, or have feature requests? Message our admin directly on Telegram.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-200 font-medium pt-1 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{telegramConfig.supportHours}</span>
            </div>
          </div>
        </div>

        <div className="z-10 flex-shrink-0">
          <a
            href={telegramConfig.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg shadow-black/10 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Chat with Admin</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition">
                      {channel.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{channel.memberCount}</span>
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {channel.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {channel.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Channel</span>
              </div>

              <a
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Join Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
