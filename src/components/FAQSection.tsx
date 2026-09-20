import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { FAQ_LIST } from '../data/landingData';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="faq" 
      aria-label="Frequently Asked Questions"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative text-white"
    >
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>INTELLIGENCE BASE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          Frequently Asked{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Questions
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400">
          Everything you need to know about GEN MUSIC, APK/App installation, offline audio cache, and vehicle head-unit integration.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_LIST.map((item) => {
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              id={`faq-item-${item.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl ${
                isOpen
                  ? 'bg-[#0e1329]/95 border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                  : 'bg-[#0c0f1e]/80 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <button
                onClick={() => toggleAccordion(item.id)}
                id={`faq-trigger-${item.id}`}
                aria-expanded={isOpen}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className={`text-base font-bold transition font-heading ${
                  isOpen ? 'text-cyan-300' : 'text-white'
                }`}>
                  {item.question}
                </span>

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/[0.04] text-slate-400 border border-white/10'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div 
                  id={`faq-content-${item.id}`}
                  className="px-6 pb-5 pt-2 text-sm text-slate-300 leading-relaxed border-t border-white/10"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
