'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

/** Where the film lives. Swap or add sources here; nothing else needs to change. */
export const EXPLAINER = {
  sources: [
    { src: "/media/GrowthPrint-Premium-1080p.mp4", type: "video/webm" },
  ],
  poster: "/media/growthprint-explainer-poster.webp",
  captions: "/media/captions/growthprint-en.vtt",
  durationLabel: "58 seconds",
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
    <div className="relative w-full">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-mk-purple/30 via-mk-blue/15 to-transparent blur-3xl" />
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-mk-line bg-mk-code shadow-[0_40px_120px_-40px_rgb(0_0_0/0.55)]">
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
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-mk-code/70 via-transparent to-transparent">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 sm:h-24 sm:w-24">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mk-purple to-mk-blue sm:h-16 sm:w-16">
                <Play className="ml-1 h-6 w-6 fill-mk-accent-fg text-mk-accent-fg" aria-hidden="true" />
              </span>
            </span>
            <span className="absolute bottom-7 left-8 hidden text-left text-[15px] font-medium text-white/85 sm:block">
              Play the overview <span className="font-light text-white/60">({EXPLAINER.durationLabel}, captions on)</span>
            </span>
          </button>
        )}

        {failed && (
          <p role="status" className="absolute inset-x-6 bottom-6 rounded-xl bg-mk-code/90 px-4 py-3 text-sm text-white/80">
            This browser can't play the video format. The captions file has the full script:{' '}
            <a className="text-mk-blue underline" href={EXPLAINER.captions}>read the transcript</a>.
          </p>
        )}
      </div>
    </div>
  );
}
