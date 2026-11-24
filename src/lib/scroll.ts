type Tick = (time: number) => void;

const subscribers = new Set<Tick>();
let lenis: import('lenis').default | null = null;

export function startScroll(reducedMotion: boolean): () => void {
  if (!reducedMotion) {
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    });
  }

  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    subscribers.forEach((fn) => fn(time));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

export function scrollToHash(hash: string) {
  const target = hash === '#top' ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: 'smooth' });
  }
  history.replaceState(null, '', hash === '#top' ? ' ' : hash);
}
