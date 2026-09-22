import { ReactNode, useEffect, useRef, useState } from 'react';

const apiOrigin = (() => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  return configured ? configured.replace(/\/$/, '').replace(/\/api$/, '') : '';
})();

/**
 * Re-runs the existing page data loaders when another session changes data.
 * This is a React remount, not a browser refresh, so the current URL stays put.
 */
export default function RealtimeBoundary({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const refreshTimer = useRef<number | undefined>();

  useEffect(() => {
    const stream = new EventSource(`${apiOrigin}/api/realtime`);
    const refresh = () => {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => setVersion((current) => current + 1), 120);
    };
    stream.addEventListener('data-change', refresh);
    return () => {
      window.clearTimeout(refreshTimer.current);
      stream.removeEventListener('data-change', refresh);
      stream.close();
    };
  }, []);

  return <div key={version} className="contents">{children}</div>;
}
