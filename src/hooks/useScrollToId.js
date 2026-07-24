import { useEffect } from 'react';

/**
 * Scroll to a DOM element by id once it appears.
 * Retries on animation frames so async-mounted content (e.g. after a fetch) is supported.
 *
 * @param {string|null|undefined} id - element id to scroll to; no-op when falsy
 * @param {Object} [options] - scroll options
 * @param {ScrollBehavior} [options.behavior='smooth'] - scrollIntoView behavior
 * @param {ScrollLogicalPosition} [options.block='start'] - vertical alignment
 * @param {number} [options.maxAttempts=90] - max rAF retries (~1.5s at 60fps)
 * @param {function} [options.onScrolled] - called after a successful scroll
 */
export function useScrollToId(id, { behavior = 'smooth', block = 'start', maxAttempts = 90, onScrolled } = {}) {
  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;

      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior, block });
        onScrolled?.();
        return;
      }

      if (attempts++ < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();

    return () => {
      cancelled = true;
    };
  }, [id, behavior, block, maxAttempts, onScrolled]);
}
