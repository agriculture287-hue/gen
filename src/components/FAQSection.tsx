import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_LIST } from '../data/landingData';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_LIST[0]?.id || null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="faq" 
      aria-label="Frequently Asked Questions"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10"
    >
      {/* Section Header */}
      <div className="text-center mb-14 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
          Everything you need to know about package installation, offline storage, and audio capabilities.
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
              className={`surface-card overflow-hidden transition-colors ${
                isOpen ? 'border-sky-500/40 bg-slate-900/90' : 'border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(item.id)}
                id={`faq-trigger-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${item.id}`}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className={`text-sm sm:text-base font-semibold transition-colors ${
                  isOpen ? 'text-sky-400' : 'text-white'
                }`}>
                  {item.question}
                </span>

                <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-sky-400' : ''
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div 
                  id={`faq-content-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${item.id}`}
                  className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5"
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
