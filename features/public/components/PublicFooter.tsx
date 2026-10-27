import React from 'react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { scrollToSection } from '../../../lib/scroll.ts';

function handleFooterSectionClick(event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) {
  event.preventDefault();
  scrollToSection(sectionId);
}

export function PublicFooter({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                GP
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                GrowthPrint
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              GrowthPrint helps growing teams build useful software, improve the systems they already have, and remove repetitive work.
            </p>
            <div className="pt-2 text-sm text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>contact@growthprint.agency</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>San Francisco, CA · Working with teams anywhere</span>
              </div>
            </div>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className="hover:text-white transition-colors">
                  Custom Software Development
                </a>
              </li>
              <li>
                <a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className="hover:text-white transition-colors">
                  Website & Application Support
                </a>
              </li>
              <li>
                <a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className="hover:text-white transition-colors">
                  Technical SEO & Optimization
                </a>
              </li>
              <li>
                <a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className="hover:text-white transition-colors">
                  Business Process Automation
                </a>
              </li>
              <li>
                <a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className="hover:text-white transition-colors">
              Useful AI and automation
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Client access
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    if (isMockMode) {
                      dispatch(switchRole('CLIENT'));
                      dispatch(setActiveView('PORTAL'));
                    } else {
                      router.push('/portal/login');
                    }
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1 text-blue-400"
                >
                  <span>Open the client portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (isMockMode) {
                      dispatch(switchRole('ADMIN'));
                      dispatch(setActiveView('ADMIN'));
                    } else {
                      router.push('/admin/login');
                    }
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1 text-slate-400"
                >
                  <span>Open the team workspace</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <a href="#process" onClick={(event) => handleFooterSectionClick(event, 'process')} className="hover:text-white transition-colors">
                  How we work
                </a>
              </li>
              <li>
                <a href="#work" onClick={(event) => handleFooterSectionClick(event, 'work')} className="hover:text-white transition-colors">
                  Client work
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(event) => handleFooterSectionClick(event, 'faq')} className="hover:text-white transition-colors">
                  Common questions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Inquiry CTA */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Start a conversation
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Need to build something, fix something, or make a routine task easier?
            </p>
            <button
              onClick={onOpenQuote}
              className="mt-2 w-full py-3 px-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs"
            >
              Tell us what you need
            </button>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 GrowthPrint Technology Partners LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
