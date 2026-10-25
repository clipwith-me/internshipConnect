import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';

/**
 * Shell for every public (marketing / informational) page:
 * skip link, one navigation, <main>, one footer.
 *
 * Also fixes client-side navigation scroll: React Router does not scroll to a
 * #hash target or reset scroll on route change by itself.
 */
export default function PublicLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick so the target section has rendered on the new route.
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <PublicNav />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
