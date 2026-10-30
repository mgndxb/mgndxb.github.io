/* eslint-disable @next/next/no-img-element -- static export serves these images as-is */

/** Every screenshot ships in two widths; `-640`/`-400` is the small one for phones. */
function smaller(src: string, width: number) {
  return src.replace(/\.webp$/, `-${width}.webp`);
}

/**
 * A browser window whose page scrolls inside it (the `data-scroll-img` image is moved by GSAP).
 * Images start lazy; the showroom switches them to eager shortly before they come into view.
 */
export function BrowserFrame({ src, height, url, alt }: { src: string; height: number; url: string; alt: string }) {
  return (
    <div className="browser">
      <div className="flex h-9 items-center gap-3 border-b border-white/[0.06] bg-[#141417] px-3.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto flex h-6 min-w-0 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 font-mono text-[11px] text-ash">
          <svg viewBox="0 0 12 12" className="size-2.5 shrink-0" aria-hidden>
            <path d="M3 5V3.5a3 3 0 0 1 6 0V5M2.5 5h7v5.5h-7z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="truncate">{url}</span>
        </span>
        <span className="w-[42px]" aria-hidden />
      </div>
      <div data-viewport className="relative aspect-[16/10] overflow-hidden bg-black">
        <img
          data-scroll-img
          src={src}
          srcSet={`${smaller(src, 640)} 640w, ${src} 1200w`}
          sizes="(min-width: 1024px) 56vw, 92vw"
          width={1200}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-x-0 top-0 h-auto w-full"
        />
      </div>
    </div>
  );
}

export function PhoneFrame({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 15vw, 30vw",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-screen">
        <img
          src={src}
          srcSet={`${smaller(src, 400)} 400w, ${src} 780w`}
          sizes={sizes}
          width={780}
          height={1688}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}
