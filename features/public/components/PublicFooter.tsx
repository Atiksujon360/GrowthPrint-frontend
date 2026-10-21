import React from 'react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export function PublicFooter({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();

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
              An AI-powered IT services agency helping businesses build custom software, maintain critical digital applications, and automate operational workflows.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>contact@growthprint.agency</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>San Francisco, CA · Remote Global Delivery</span>
              </div>
            </div>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Custom Software Development
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Website & Application Support
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Technical SEO & Optimization
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Business Process Automation
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  AI Integration & Emerging Tech
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Platform & Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    dispatch(switchRole('CLIENT'));
                    dispatch(setActiveView('PORTAL'));
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1 text-blue-400"
                >
                  <span>Client Portal Sign In</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    dispatch(switchRole('ADMIN'));
                    dispatch(setActiveView('ADMIN'));
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1 text-slate-400"
                >
                  <span>Admin Workspace (Founder)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <a href="#process" className="hover:text-white transition-colors">
                  Methodology & SLA
                </a>
              </li>
              <li>
                <a href="#work" className="hover:text-white transition-colors">
                  Verified Case Studies
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Inquiry CTA */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Start an Engagement
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ready to scope a new platform, fix critical bugs, or automate operations?
            </p>
            <button
              onClick={onOpenQuote}
              className="mt-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs"
            >
              Request Project Estimate
            </button>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} GrowthPrint Technology Partners LLC. All rights reserved.
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
