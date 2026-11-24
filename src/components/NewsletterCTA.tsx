import { useState, type FormEvent } from 'react';
import { EDITION } from '../data/edition';
import { useReveals } from '../hooks/useReveals';

export function NewsletterCTA() {
  const ref = useReveals<HTMLElement>();
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <section ref={ref} id="subscribe" aria-labelledby="newsletter-title" className="newsletter">
      <div className="section-inner">
        <div className="newsletter__inner">
          <div data-reveal>
            <p className="newsletter__kicker">Stay Informed</p>
            <h2 id="newsletter-title" className="newsletter__title">
              Subscribe to<br />the <em>Circuit</em>
            </h2>
            <p className="newsletter__body">
              The best of AI journalism, delivered weekly. No noise — only stories that matter, verified and sourced.
            </p>
            <div className="newsletter__stats">
              {[
                { v: `${EDITION.stories.length}+`, l: 'Stories/issue' },
                { v: 'Weekly',  l: 'Cadence'  },
                { v: 'Free',    l: 'Always'   },
              ].map(s => (
                <div key={s.l}>
                  <div className="newsletter__stat-val">{s.v}</div>
                  <div className="newsletter__stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal style={{ transitionDelay: '100ms' }}>
            {status === 'sent' ? (
              <div className="newsletter__success">
                <div className="newsletter__success-icon">⚡</div>
                <p className="newsletter__success-title">You're on the manifest.</p>
                <p className="newsletter__success-body">
                  We'll write when the next edition drops.
                </p>
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={onSubmit} noValidate>
                <input className="newsletter__field" type="text" name="name" required autoComplete="name" placeholder="Your name" />
                <input className="newsletter__field" type="email" name="email" required autoComplete="email" placeholder="you@email.com" />
                <button type="submit" className="newsletter__submit">
                  Add me to the manifest
                </button>
                <p className="newsletter__note">No spam · No paywall · Cancel anytime</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
