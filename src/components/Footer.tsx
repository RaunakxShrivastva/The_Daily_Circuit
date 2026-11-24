import { EDITION } from '../data/edition';

export function Footer() {
  return (
    <footer className="footer">
      <div className="section-inner">
        <div className="footer__inner">
          <span className="footer__brand">THE DAILY CIRCUIT</span>
          <span className="footer__meta">{EDITION.issueNo} · {EDITION.issueDate}</span>
          <span className="footer__meta">
            Artificial intelligence · science · technology · the future
          </span>
          <span className="footer__meta">© {new Date().getFullYear()} · Design prototype</span>
        </div>
      </div>
    </footer>
  );
}
