/* ============================================================================
 * Meridian Line — Ship-Scroll (Bird's-Eye View)
 * ----------------------------------------------------------------------------
 * The hero shows open ocean viewed from directly above. A container ship
 * (rendered as a tall top-down SVG) sits with its bow peeking into the
 * bottom of the viewport; as the user scrolls, the ship sails upward on
 * screen, revealing its full length before disappearing off the top.
 *
 * Behaviour
 * ---------
 * • Hero section is pinned for the duration of the voyage.
 * • Ship wrapper translates upward by ~165vh — enough distance for the
 *   entire ship (stern + wake) to clear the viewport, since most of the
 *   SVG starts below the fold.
 * • Water colour darkens from open-sea blue → deep → abyss, handing off
 *   seamlessly to the content section.
 * • Water texture layers drift slightly to sell the sense of motion past
 *   the viewer rather than the ship moving alone.
 * • Headline and scroll cue fade as the viewer descends.
 *
 * Customisation
 * -------------
 * • PIN_DURATION controls how much scroll distance the animation consumes.
 * • SHIP_TRAVEL_VH controls how far up the ship moves — increase if your
 *   ship SVG is even taller, decrease for a shorter hull.
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
  const PIN_DURATION   = '+=170%';  // scroll distance the pin consumes
  const SHIP_TRAVEL_VH = -165;      // how far up the ship wrapper travels

  // Palette pulled from CSS custom properties so the theme stays in sync.
  const css = getComputedStyle(document.documentElement);
  const palette = {
    openSea: css.getPropertyValue('--c-openSea').trim() || '#123558',
    deep:    css.getPropertyValue('--c-deep').trim()    || '#0a2340',
    abyss:   css.getPropertyValue('--c-abyss').trim()   || '#071829',
    trench:  css.getPropertyValue('--c-trench').trim()  || '#030c16',
  };

  if (prefersReduced) return;

  /* --------------------------------------------------------------------------
   * Element refs
   * ------------------------------------------------------------------------ */
  const hero     = document.querySelector('#hero');
  const ship     = document.querySelector('#ship');
  const headline = document.querySelector('.hero-headline');
  const texture  = document.querySelector('.water-texture');
  const streaks  = document.querySelector('.water-streaks');
  const cue      = document.querySelector('.scroll-cue');

  if (!hero || !ship) {
    console.warn('[Meridian] Hero or ship element missing — aborting animation.');
    return;
  }

  /* --------------------------------------------------------------------------
   * Scroll-linked timeline — pins the hero and scrubs all effects together.
   * ------------------------------------------------------------------------ */
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start:   'top top',
      end:     PIN_DURATION,
      pin:     true,
      scrub:   0.6,
      anticipatePin: 1,
      // markers: true, // uncomment while tuning
    },
  });

  // -- Background: open sea → deeper water → abyss --------------------------
  // The radial glints fade out as we descend, giving a sense of sinking
  // below the sunlit surface layer into darker water.
  tl.to(hero, {
    background:
      `radial-gradient(ellipse 80% 60% at 20% 85%, rgba(70,120,160,0.05) 0%, transparent 55%),
       radial-gradient(ellipse 60% 50% at 85% 15%, rgba(5,15,28,0.5) 0%, transparent 60%),
       linear-gradient(170deg, ${palette.deep} 0%, ${palette.abyss} 55%, ${palette.trench} 100%)`,
    duration: 1,
  }, 0);

  // -- Ship: sails up and out of frame --------------------------------------
  // Wrapper starts with bottom: -75vh (bow visible), moves upward.
  tl.to(ship, {
    y:       `${SHIP_TRAVEL_VH}vh`,
    scale:   0.95,
    duration: 1,
  }, 0);

  // -- Water texture: drifts downward relative to the ship, reinforcing
  //    the illusion that the viewer is moving with the vessel ------------
  if (texture) {
    tl.to(texture, {
      backgroundPosition: '0px 400px',
      opacity: 0.2,
      duration: 1,
    }, 0);
  }
  if (streaks) {
    tl.to(streaks, {
      y: 120,
      opacity: 0.1,
      duration: 1,
    }, 0);
  }

  // -- Headline: lifts and fades roughly half way through -------------------
  if (headline) {
    tl.to(headline, {
      y:       -80,
      opacity: 0,
      duration: 0.55,
    }, 0);
  }

  // -- Scroll cue: disappears almost immediately once scrolling starts ------
  if (cue) {
    tl.to(cue, { opacity: 0, duration: 0.15 }, 0);
  }

  /* --------------------------------------------------------------------------
   * Rebuild on significant resize
   * ------------------------------------------------------------------------ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  /* --------------------------------------------------------------------------
   * Content section: gentle one-shot reveals on entry
   * ------------------------------------------------------------------------ */
  gsap.from('#content h2', {
    y: 40,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#content h2', start: 'top 80%', once: true },
  });

  gsap.from('#content .grid > *', {
    y: 30,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#content .grid', start: 'top 75%', once: true },
  });
})();
