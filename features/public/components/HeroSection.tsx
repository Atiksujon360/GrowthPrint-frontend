import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Terminal, Layers, ArrowUpRight } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { setActiveView, switchRole } from '../../../store/index.ts';
import heroImage from '../../../assets/images/hero_agency_workspace_1792450306060.jpg';

export function HeroSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value proposition and primary CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wider uppercase">
              <span>Your Technology Partner</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>Founder-Led Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
              Technology That Moves Your Business Forward.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              From custom software and website improvements to business automation, GrowthPrint helps businesses solve technical bottlenecks and build resilient digital operations.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenQuote}
                className="px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2.5"
              >
                <span>Let&apos;s Discuss Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#services"
                className="px-6 py-3.5 text-base font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Explore Services</span>
              </a>

              <button
                onClick={() => {
                  dispatch(switchRole('CLIENT'));
                  dispatch(setActiveView('PORTAL'));
                }}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 ml-2"
              >
                <span>Already a client? Sign in</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trust bullet strip */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Defined scope & transparent estimates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct founder oversight & delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-day post-launch warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic / Studio Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
              {!imageError ? (
                <img
                  src={heroImage.src}
                  alt="GrowthPrint engineering team collaborating on enterprise software architecture"
                  className="w-full h-[380px] lg:h-[440px] object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-[380px] lg:h-[440px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-blue-400">GrowthPrint Studio</span>
                    <Terminal className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">Reliable Engineering for Scalable Operations</h3>
                    <p className="text-sm text-slate-300">Web applications, business automation, and ongoing technical maintenance.</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">TypeScript · React · Next.js · Node.js</div>
                </div>
              )}

              {/* Quiet overlay label */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">GrowthPrint IT Services</div>
                  <div className="text-[11px] text-slate-500">Custom Software · Maintenance · Automation</div>
                </div>
                <span className="text-xs font-medium text-blue-600">Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Strip below the split */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">14+</div>
            <div className="text-xs font-medium text-slate-500">Production Systems Delivered</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">35%</div>
            <div className="text-xs font-medium text-slate-500">Average Process Latency Cut</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">100%</div>
            <div className="text-xs font-medium text-slate-500">Founder-Led Technical Review</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">99.9%</div>
            <div className="text-xs font-medium text-slate-500">Automated Pipeline Reliability</div>
          </div>
        </div>
      </div>
    </section>
  );
}
