/* ============================================================================
 * Meridian Line — Ship-Scroll
 * ----------------------------------------------------------------------------
 * Scroll-linked hero animation using GSAP + ScrollTrigger.
 *
 * Behaviour
 * ---------
 * • Hero section is pinned for the duration of the voyage animation.
 * • Ship translates vertically from its starting position (bottom of viewport)
 *   up and past the top edge. The motion is "scrubbed" — tied 1:1 to scroll
 *   progress so the user controls the pace.
 * • Background shifts from a bright morning palette (sky → horizon → sea)
 *   into the deep abyss that the content section sits in, producing a seamless
 *   hand-off to Chapter II.
 * • Decorative elements (wave layers, headline copy, scroll cue) fade and
 *   drift to emphasise the descent.
 *
 * Customisation
 * -------------
 * • Tweak PIN_DURATION to shorten/lengthen the scroll distance required to
 *   complete the voyage.
 * • Palette stops are defined in CSS custom properties (see index.html) and
 *   referenced here by name — change them in one place.
 * ========================================================================== */

(function () {
  'use strict';

  // Respect users who prefer reduced motion — deliver a static, readable page.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wait for GSAP to be available (loaded via CDN in the head).
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[Meridian] GSAP or ScrollTrigger failed to load.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* --------------------------------------------------------------------------
   * Configuration
   * ------------------------------------------------------------------------ */
  // How much scroll distance the pinned hero consumes.
  // "+=150%" means the user must scroll 1.5× the viewport height to complete
  // the voyage animation. Increase for a slower, more cinematic scrub.
  const PIN_DURATION = '+=150%';


  /* --------------------------------------------------------------------------
   * Reduced-motion fallback
   * Display the hero as-is without pinning or scrubbing.
   * ------------------------------------------------------------------------ */
  if (prefersReduced) {
    return;
  }

  /* --------------------------------------------------------------------------
   * Main scroll-triggered timeline
   * ------------------------------------------------------------------------ */
  const hero     = document.querySelector('#hero');
  const ship     = document.querySelector('#ship');
  const headline = document.querySelector('.hero-headline');
  const waves    = document.querySelectorAll('#hero .wave');
  const haze     = document.querySelector('#hero .horizon-haze');
  const cue      = document.querySelector('.scroll-cue');

  if (!hero || !ship) {
    console.warn('[Meridian] Hero or ship element missing — aborting animation.');
    return;
  }

  // Build a timeline attached to a ScrollTrigger that pins the hero.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start:   'top top',
      end:     PIN_DURATION,
      pin:     true,
      scrub:   0.6,          // slight smoothing on the scrub
      anticipatePin: 1,
      // markers: true,      // uncomment while debugging
    },
  });

  // -- Background gradient: shift from morning to abyss --------------------
  //
  // We animate the `background` property directly. GSAP tweens the gradient
  // stops (it understands the syntax), producing a smooth colour transition
  // rather than a hard swap.
  tl.to(hero, {
    background: `linear-gradient(180deg, #1e1b4b 0%, #1e1b4b 100%)`,
    duration: 1,
  }, 0);

  // -- Ship: travel from bottom of viewport to above the top --------------
  //
  // Starting transform is handled by CSS (bottom: 8vh, translateX(-50%)).
  // We translate it upward by roughly 120vh so it fully exits the viewport.
  // A tiny horizontal drift adds parallax personality without feeling wobbly.
  tl.to(ship, {
    y:     '-120vh',
    x:     '-20px',
    scale: 0.92,
    duration: 1,
  }, 0);

  // -- Waves: drift downward and fade as we descend -----------------------
  waves.forEach((wave, i) => {
    tl.to(wave, {
      y:       30 + i * 20,
      opacity: 0,
      duration: 1,
    }, 0);
  });

  // -- Horizon haze: fades as the horizon itself disappears ---------------
  if (haze) {
    tl.to(haze, { opacity: 0, duration: 0.6 }, 0);
  }

  // -- Headline: drifts up and fades ~40% into the scroll -----------------
  if (headline) {
    tl.to(headline, {
      y:       -60,
      opacity: 0,
      duration: 0.5,
    }, 0);
  }

  // -- Scroll cue: fades out almost immediately ---------------------------
  if (cue) {
    tl.to(cue, { opacity: 0, duration: 0.15 }, 0);
  }

  /* --------------------------------------------------------------------------
   * Responsive: rebuild on significant resize (e.g. orientation change)
   * ------------------------------------------------------------------------ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  /* --------------------------------------------------------------------------
   * Content section: gentle reveal of the factoids and CTA on entry.
   * Purely decorative — not scrubbed, just a one-shot fade-in.
   * ------------------------------------------------------------------------ */
  gsap.from('#content h2', {
    y: 40,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#content h2',
      start:   'top 80%',
      once:    true,
    },
  });

  gsap.from('#content .grid > *', {
    y: 30,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#content .grid',
      start:   'top 75%',
      once:    true,
    },
  });
})();

console.log("hero:", document.querySelector("#hero"));
console.log("ship:", document.querySelector("#ship"));
console.log("content:", document.querySelector("#content"));