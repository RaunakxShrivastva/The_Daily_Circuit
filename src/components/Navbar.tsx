import { useEffect, useState } from 'react';
import type { Story } from '../data/types';
import { EDITION } from '../data/edition';

const links = [
  { label: "Edition",  href: '#edition'  },
  { label: "Stories",  href: '#stories'  },
  { label: "Subscribe",href: '#subscribe'},
];

function Menu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}
function Close() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function Navbar({ onOpenStory }: { onOpenStory: (s: Story) => void }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    const el = document.querySelector<HTMLElement>(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else if (href === '#top') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      {/* Nameplate */}
      <a
        className="nav__brand"
        href="#top"
        onClick={e => { e.preventDefault(); go('#top'); }}
        aria-label="The Daily Circuit — back to top"
      >
        <span className="nav__name">THE DAILY CIRCUIT</span>
        <span className="nav__issue-tag">{EDITION.issueNo}</span>
      </a>

      {/* Pill nav */}
      <nav className="nav__pill" aria-label="Primary">
        <ul>
          {links.map(link => (
            <li key={link.label}>
              <a href={link.href} onClick={e => { e.preventDefault(); go(link.href); }}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Actions */}
      <div className="nav__actions">
        <a
          className="btn btn--flame"
          href="#"
          onClick={e => { e.preventDefault(); onOpenStory(EDITION.stories[0]); }}
        >
          Lead Story
        </a>
        <button
          className="nav__burger"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="nav__sheet">
          <ul>
            {links.map(link => (
              <li key={link.label}>
                <a href={link.href} onClick={e => { e.preventDefault(); go(link.href); }}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="btn btn--flame nav__sheet-cta"
            href="#"
            onClick={e => { e.preventDefault(); setOpen(false); onOpenStory(EDITION.stories[0]); }}
          >
            Read Lead Story
          </a>
        </div>
      )}
    </header>
  );
}
