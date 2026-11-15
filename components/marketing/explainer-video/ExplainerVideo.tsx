'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

/** Where the film lives. Swap or add sources here; nothing else needs to change. */
export const EXPLAINER = {
  sources: [{ src: '/media/growthprint-explainer.webm', type: 'video/webm' }],
  poster: '/media/growthprint-explainer-poster.webp',
  captions: '/media/captions/growthprint-en.vtt',
  durationLabel: '58 seconds',
} as const;

/**
 * Native video with our own poster and play button. Nothing downloads until the visitor presses play
 * (preload="none"); it never autoplays. After the first press the browser's own controls take over
 * (pause, seek, volume, captions, full screen), which are keyboard and screen-reader accessible.
 */
export function ExplainerVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = async () => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    try {
      await video.play();
    } catch {
      // Autoplay policies can block play() without user activation; the visible controls still let the visitor start it.
    }
    video.focus();
  };

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-mk-purple/35 via-mk-blue/20 to-transparent blur-3xl" />
      <div className="relative aspect-video overflow-hidden rounded-[22px] border border-white/15 bg-mk-surface shadow-[0_40px_120px_-40px_rgb(116_38_201/0.7)]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={EXPLAINER.poster}
          preload="none"
          playsInline
          controls={started}
          onError={() => setFailed(true)}
          aria-label={`GrowthPrint overview, ${EXPLAINER.durationLabel}, with English captions`}
        >
          {EXPLAINER.sources.map(s => <source key={s.src} src={s.src} type={s.type} onError={() => setFailed(true)} />)}
          <track kind="captions" src={EXPLAINER.captions} srcLang="en" label="English" default />
        </video>

        {!started && (
          <button type="button" onClick={() => void start()}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-mk-bg/60 via-transparent to-transparent">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 sm:h-24 sm:w-24">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mk-purple to-mk-blue sm:h-16 sm:w-16">
                <Play className="ml-1 h-6 w-6 fill-white text-white" aria-hidden="true" />
              </span>
            </span>
            <span className="absolute bottom-7 left-8 hidden text-left text-base text-white/85 sm:block">
              Play the overview <span className="text-white/60">({EXPLAINER.durationLabel}, captions on)</span>
            </span>
          </button>
        )}

        {failed && (
          <p role="status" className="absolute inset-x-6 bottom-6 rounded-xl bg-mk-bg/85 px-4 py-3 text-sm text-mk-muted">
            This browser can't play the video format. The captions file has the full script:{' '}
            <a className="text-white underline" href={EXPLAINER.captions}>read the transcript</a>.
          </p>
        )}
      </div>
    </div>
  );
}
