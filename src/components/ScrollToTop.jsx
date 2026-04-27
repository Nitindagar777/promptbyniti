import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop Component
 * - Scrolls to top on forward navigation (PUSH)
 * - Browser handles scroll restoration on back/forward buttons (POP)
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only scroll to top if the navigation is a 'PUSH' (e.g. clicking a link)
    // If it's a 'POP' (back button), we let the browser handle restoration
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}
