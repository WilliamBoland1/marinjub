/* ============================================================================
 * To is — Solnedgang-Scroll
 * ----------------------------------------------------------------------------
 * Scroll-linked hero animation using GSAP + ScrollTrigger.
 *
 * Behaviour
 * ---------
 * • Hero section is pinned for the duration of the sunset animation.
 * • Ice cream translates vertically from its starting position (bottom of
 *   viewport) up and past the top edge. The motion is "scrubbed" — tied 1:1
 *   to scroll progress so the user controls the pace.
 * • Background shifts from a bright sunset palette (sky → horizon → sea)
 *   into the deep night that the content section sits in, producing a seamless
 *   hand-off to Del II.
 * • Decorative elements (waves, sand dune, headline, scroll cue) fade and
 *   drift as the sun sets and darkness falls.
 *
 * Customisation
 * -------------
 * • Tweak PIN_DURATION to shorten/lengthen the scroll distance required to
 *   complete the sunset animation.
 * • Palette stops are defined in CSS custom properties (see index.html) and
 *   referenced here by name — change them in one place.
 * ========================================================================== */

(function () {
  'use strict';

  // Respect users who prefer reduced motion — deliver a static, readable page.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wait for GSAP to be available (loaded via CDN in the head).
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[ToIs] GSAP or ScrollTrigger failed to load.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* --------------------------------------------------------------------------
   * Configuration
   * ------------------------------------------------------------------------ */
  // How much scroll distance the pinned hero consumes.
  // "+=150%" means the user must scroll 1.5× the viewport height to complete
  // the sunset animation. Increase for a slower, more cinematic scrub.
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
  const iceCream = document.querySelector('#ship');
  const headline = document.querySelector('.hero-headline');
  const waves    = document.querySelectorAll('#hero .wave');
  const dune     = document.querySelector('#hero .horizon-haze');
  const cue      = document.querySelector('.scroll-cue');

  if (!hero || !iceCream) {
    console.warn('[ToIs] Hero or ice cream element missing — aborting animation.');
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

  // -- Background: shift from sunset to deep night --------------------------
  //
  // We animate the `background` property directly. GSAP tweens the gradient
  // stops, producing a smooth colour transition rather than a hard swap.
  tl.to(hero, {
    background: `linear-gradient(180deg, #1e1b4b 0%, #1e1b4b 100%)`,
    duration: 1,
  }, 0);

  // -- Ice cream: float upward from beach toward the darkening sky ----------
  //
  // Starting transform is handled by CSS (bottom: 14vh, translateX(-50%)).
  // We translate it upward by roughly 120vh so it fully exits the viewport.
  // A tiny horizontal drift adds parallax personality without feeling wobbly.
  tl.to(iceCream, {
    y:     '-120vh',
    x:     '-20px',
    scale: 0.92,
    duration: 1,
  }, 0);

  // -- Waves: drift down and fade — fully gone by ~50% of the scroll --------
  waves.forEach((wave, i) => {
    tl.to(wave, {
      y:       30 + i * 20,
      opacity: 0,
      duration: 0.5,
    }, 0);
  });

  // -- Sand dune: fades out by ~35% of the scroll ---------------------------
  if (dune) {
    tl.to(dune, { opacity: 0, duration: 0.35 }, 0);
  }

  // -- Headline: drifts up and fades early in the scroll --------------------
  if (headline) {
    tl.to(headline, {
      y:       -60,
      opacity: 0,
      duration: 0.5,
    }, 0);
  }

  // -- Scroll cue: fades out almost immediately -----------------------------
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
   * Del II: gentle reveal of the dialogue and CTA on entry.
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
