import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Instagram, 
  Youtube, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { CONTACT_CHANNELS } from '../data/landingData';
import { TelegramConfig } from '../types';

interface ContactSectionProps {
  onShowToast: (msg: string) => void;
  telegramConfig?: TelegramConfig;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  onShowToast,
  telegramConfig 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Feedback',
    message: '',
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setFormSubmitted(true);
    onShowToast('Thank you! Your message has been sent to the GEN MUSIC team.');
  };

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'Send': return <Send className="w-5 h-5 text-blue-600" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'Youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      default: return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  // Channels with live telegram contact
  const channels = CONTACT_CHANNELS.map((ch) => {
    if (ch.id === 'contact-telegram' && telegramConfig) {
      return {
        ...ch,
        handle: telegramConfig.contactUsername,
        link: telegramConfig.contactUrl,
      };
    }
    return ch;
  });

  return (
    <section 
      id="contact" 
      aria-label="Contact Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support & Community</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Connect with{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            GEN MUSIC
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          Reach out for technical support, request new features, or connect directly with our admin on Telegram.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 4 Official Channels Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Channels
            </h3>
            <span className="text-xs text-blue-600 font-semibold">
              Admin Direct: {telegramConfig?.contactUsername || '@genmusic_admin'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map((channel) => {
              const isCopied = copiedId === channel.id;

              return (
                <div
                  key={channel.id}
                  id={`contact-card-${channel.id}`}
                  className="rounded-3xl bg-white p-5 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition">
                        {getChannelIcon(channel.icon)}
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {channel.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-heading">
                        {channel.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {channel.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-700 font-semibold truncate max-w-[140px]">
                      {channel.handle}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(channel.id, channel.handle)}
                        id={`copy-contact-${channel.id}`}
                        aria-label={`Copy ${channel.name}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        title="Copy handle"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <a
                        href={channel.link}
                        target="_blank"
                        rel="noreferrer"
                        id={`open-contact-${channel.id}`}
                        aria-label={`Open ${channel.name}`}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message & Feedback Form */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Send Direct Message
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our team and admin review inquiries daily.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2.5 my-auto">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Message Dispatched</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    We've received your note! We'll reply to <span className="font-mono text-emerald-700 font-bold">{formData.email}</span> as soon as possible.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', category: 'Feedback', message: '' });
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Ankit"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-category" className="text-xs font-semibold text-slate-700">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    >
                      <option value="Feedback">App Feedback & Suggestions</option>
                      <option value="Bug">Bug or Playback Issue Report</option>
                      <option value="APK">Direct APK / App Link Request</option>
                      <option value="Partnership">Partnership & Creator Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={3}
                      placeholder="Tell us what you love or what needs fixing..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Send Message</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
