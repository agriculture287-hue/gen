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
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative"
    >
      {/* Section Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Help & Clarity</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Frequently Asked{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Questions
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          Everything you need to know about GEN MUSIC, APK/App installation, offline MP3s, and Dolby Audio.
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
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => toggleAccordion(item.id)}
                id={`faq-trigger-${item.id}`}
                aria-expanded={isOpen}
                className="w-full px-6 py-4.5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className={`text-base font-bold transition font-heading ${
                  isOpen ? 'text-blue-700' : 'text-slate-900'
                }`}>
                  {item.question}
                </span>

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div 
                  id={`faq-content-${item.id}`}
                  className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-blue-100/60"
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
