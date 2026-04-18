/* ============================================================================
 * Meridian Line — Ship-Scroll
 * ----------------------------------------------------------------------------
 * A single pinned stage. On load: open ocean, ship's BOW peeking up from the
 * bottom. On scroll: ship sails upward, its wake paints a luminous trail down
 * the centre, and the Meridian Line website is revealed THROUGH that wake.
 *
 * Three phases, all scrubbed to scroll progress
 * ---------------------------------------------
 *   [0.00 – 0.55]  SHIP TRAVELS
 *                  Ship translates from bottom-of-viewport up and off the top.
 *                  Headline + scroll cue fade. Water darkens slightly.
 *
 *   [0.15 – 0.70]  WAKE PAINTS
 *                  A soft foam-trail gradient grows downward from where the
 *                  ship has passed, marking the channel where content appears.
 *
 *   [0.40 – 1.00]  DESTINATION REVEALS
 *                  The full editorial content fades in behind the wake and
 *                  becomes interactive. Water fully transitions to abyss.
 *
 * Customisation
 * -------------
 *   PIN_DURATION      — total scroll distance the pinned stage consumes
 *   SHIP_TRAVEL_VH    — how far up the ship wrapper travels (negative = up)
 * ========================================================================== */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[Meridian] GSAP or ScrollTrigger failed to load.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* --------------------------------------------------------------------------
   * Configuration
   * ------------------------------------------------------------------------ */
  const PIN_DURATION   = '+=220%';  // a bit longer so all three phases feel deliberate
  const SHIP_TRAVEL_VH = -130;      // travel far enough for the stern + wake to clear

  const css = getComputedStyle(document.documentElement);
  const palette = {
    openSea: css.getPropertyValue('--c-openSea').trim() || '#123558',
    deep:    css.getPropertyValue('--c-deep').trim()    || '#0a2340',
    abyss:   css.getPropertyValue('--c-abyss').trim()   || '#071829',
    trench:  css.getPropertyValue('--c-trench').trim()  || '#030c16',
  };

  /* --------------------------------------------------------------------------
   * Element references
   * ------------------------------------------------------------------------ */
  const stage       = document.querySelector('#stage');
  const ship        = document.querySelector('#ship');
  const wake        = document.querySelector('#wake');
  const headline    = document.querySelector('.hero-headline');
  const destination = document.querySelector('#destination');
  const texture     = document.querySelector('.water-texture');
  const streaks     = document.querySelector('.water-streaks');
  const cue         = document.querySelector('.scroll-cue');

  if (!stage || !ship || !destination) {
    console.warn('[Meridian] Required stage element missing — aborting.');
    return;
  }

  /* --------------------------------------------------------------------------
   * Reduced-motion: show destination statically, skip the voyage
   * ------------------------------------------------------------------------ */
  if (prefersReduced) {
    gsap.set(ship,     { display: 'none' });
    gsap.set(wake,     { display: 'none' });
    gsap.set(headline, { display: 'none' });
    gsap.set(destination, { opacity: 1, pointerEvents: 'auto' });
    destination.classList.add('is-revealed');
    return;
  }

  /* --------------------------------------------------------------------------
   * Master timeline — normalized [0 → 1] across the pin duration
   * ------------------------------------------------------------------------ */
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start:   'top top',
      end:     PIN_DURATION,
      pin:     true,
      scrub:   0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Flip pointer-events on once the content is mostly visible,
        // so the user can click links and buttons without accidental hits
        // while the voyage is still running.
        if (self.progress > 0.75) {
          destination.classList.add('is-revealed');
        } else {
          destination.classList.remove('is-revealed');
        }
      },
      // markers: true,
    },
  });

  /* ----- PHASE 1 — SHIP TRAVELS [0.00 – 0.55] ----------------------------- */

  // Ship translates upward, slight scale-down for perspective
  tl.to(ship, {
    y:     `${SHIP_TRAVEL_VH}vh`,
    scale: 0.9,
    duration: 0.55,
  }, 0);

  // Headline lifts and fades ~first third
  if (headline) {
    tl.to(headline, { y: -80, opacity: 0, duration: 0.3 }, 0);
  }

  // Scroll cue disappears immediately
  if (cue) {
    tl.to(cue, { opacity: 0, duration: 0.1 }, 0);
  }

  // Water surface drifts downward relative to motion, texture slowly fades
  if (texture) {
    tl.to(texture, {
      backgroundPosition: '0px 600px',
      opacity: 0.15,
      duration: 1,
    }, 0);
  }
  if (streaks) {
    tl.to(streaks, { y: 150, opacity: 0.08, duration: 1 }, 0);
  }

  /* ----- PHASE 2 — WAKE PAINTS [0.15 – 0.70] ----------------------------- */

  // The wake grows from zero height to fill the viewport. It traces the
  // vertical channel the ship just travelled through.
  tl.fromTo(wake,
    { height: '0vh',  opacity: 0 },
    { height: '110vh', opacity: 1, duration: 0.55, ease: 'power1.out' },
    0.15
  );

  // Wake softens and fades out at the end, once content has taken over
  tl.to(wake, { opacity: 0, duration: 0.2 }, 0.75);

  /* ----- PHASE 3 — WATER → ABYSS + DESTINATION REVEAL [0.40 – 1.00] ------ */

  // Water gradient transitions to the deep abyss theme
  tl.to(stage, {
    background:
      `radial-gradient(ellipse 80% 60% at 20% 85%, rgba(70,120,160,0.02) 0%, transparent 55%),
       radial-gradient(ellipse 60% 50% at 85% 15%, rgba(5,15,28,0.55) 0%, transparent 60%),
       linear-gradient(170deg, ${palette.deep} 0%, ${palette.abyss} 55%, ${palette.trench} 100%)`,
    duration: 0.6,
  }, 0.4);

  // Destination fades in
  tl.to(destination, {
    opacity: 1,
    duration: 0.45,
  }, 0.5);

  // Subtle upward settle of the destination content for life
  tl.from(destination.querySelector('.px-6.md\\:px-12'), {
    y: 60,
    duration: 0.5,
    ease: 'power2.out',
  }, 0.5);

  /* --------------------------------------------------------------------------
   * Keep ScrollTrigger accurate on resize / orientation change
   * ------------------------------------------------------------------------ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
})();
