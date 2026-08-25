(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAME_CONFIG_REVEAL = { folder: 'frames_reveal', count: 152, prefix: 'ezgif-frame-', extension: '.jpg', pad: 3 };
  const FRAME_CONFIG_BUILD = { folder: 'frames_build', count: 126, prefix: 'ezgif-frame-', extension: '.jpg', pad: 3 };

  const framePath = (config, index) => `${config.folder}/${config.prefix}${String(index + 1).padStart(config.pad, '0')}${config.extension}`;

  function loadFrames(config) {
    return Array.from({ length: config.count }, (_, index) => {
      const image = new Image();
      image.src = framePath(config, index);
      return image;
    });
  }

  function drawCover(canvas, image) {
    if (!image.complete || !image.naturalWidth) return;
    const context = canvas.getContext('2d');
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }

  function setupCanvas(canvas, frames, section, endCard) {
    const resize = () => {
      canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
      canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
      drawCover(canvas, frames[prefersReducedMotion ? frames.length - 1 : 0]);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    frames[0].addEventListener('load', () => drawCover(canvas, frames[0]), { once: true });
    frames[frames.length - 1].addEventListener('load', () => {
      if (prefersReducedMotion) drawCover(canvas, frames[frames.length - 1]);
    }, { once: true });

    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const state = { frame: 0 };
    gsap.to(state, {
      frame: frames.length - 1,
      ease: 'none',
      snap: 'frame',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5, pin: canvas },
      onUpdate: () => drawCover(canvas, frames[Math.round(state.frame)])
    });
    if (endCard) gsap.to(endCard, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: section, start: '78% top', end: '92% top', scrub: true } });
  }

  function setupSceneBadges(section) {
    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const badges = section.querySelectorAll('.scene-badge');
    gsap.to(badges[0], { opacity: 1, y: 0, scrollTrigger: { trigger: section, start: '14% top', end: '22% top', scrub: true } });
    gsap.to(badges[0], { opacity: 0, y: -8, scrollTrigger: { trigger: section, start: '25% top', end: '30% top', scrub: true } });
    gsap.to(badges[1], { opacity: 1, y: 0, scrollTrigger: { trigger: section, start: '34% top', end: '42% top', scrub: true } });
  }

  function setupFeatureHotspots(section) {
    const hotspots = section.querySelector('.feature-hotspots');
    if (!hotspots || prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    hotspots.querySelectorAll('.feature-hotspot').forEach((hotspot, index, allHotspots) => {
      const start = allHotspots.length === 5 ? 8 + index * 8 : 10 + index * 14;
      gsap.to(hotspot, { opacity: 1, y: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: section, start: `${start}% top`, toggleActions: 'play none none none' } });
    });
  }

  function setupStatCounters() {
    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.stat strong[data-value]').forEach((element) => {
      const target = Number(element.dataset.value);
      const decimals = Number(element.dataset.decimals || 0);
      const counter = { value: 0 };
      gsap.to(counter, {
        value: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        onUpdate: () => { element.firstChild.nodeValue = counter.value.toFixed(decimals); }
      });
    });
  }

  function forceRevealStuckElements() {
    const watchedSelectors = ['.reveal-up', '.reveal-copy'];
    watchedSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const computedOpacity = parseFloat(window.getComputedStyle(element).opacity);
        if (computedOpacity < 0.05) {
          element.style.opacity = '1';
          element.style.transform = 'none';
        }
      });
    });
  }

  function setupStaticAnimations() {
    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal-up').forEach((element) => {
      gsap.to(element, { opacity: 1, y: 0, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 86%', once: true } });
    });
  }

  function setupProcessSequence() {
    const process = document.querySelector('.estimate-process');
    if (!process || prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const steps = [...process.querySelectorAll('.process-step')];
    const isMobile = window.matchMedia('(max-width: 520px)').matches;
    const timeline = gsap.timeline({ scrollTrigger: { trigger: process, start: 'top 82%', once: true } });
    timeline.set(process, { opacity: 1 }).to(steps.map((step) => step.querySelector('.process-marker')), { opacity: 1, scale: 1, duration: .55, ease: 'back.out(1.7)', stagger: .2 }).to(process.querySelector('.process-line'), { [isMobile ? 'scaleY' : 'scaleX']: 1, duration: .7, ease: 'power2.inOut' }, '>-0.1').to(steps.map((step) => step.querySelector('.process-copy')), { opacity: 1, y: 0, duration: .45, ease: 'power2.out', stagger: .15 }, '>-0.2');
  }

  function setupSmoothScroll() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (typeof ScrollTrigger !== 'undefined') lenis.on('scroll', ScrollTrigger.update);
  }

  function setupNavigation() {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
      header.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [...document.querySelectorAll('.main-nav a')];
    const updateActiveLink = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
      const current = sections.reduce((active, section) => window.scrollY + 150 >= section.offsetTop ? section : active, sections[0]);
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
    };
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  function setupForm() {
    const form = document.querySelector('#estimate-form');
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const requiredFields = [...form.querySelectorAll('[required]')];
      const missing = requiredFields.find((field) => !field.value.trim());
      if (missing) {
        status.className = 'form-status error';
        status.textContent = `Please add your ${missing.labels[0].textContent.toLowerCase()}.`;
        missing.focus();
        return;
      }
      const email = form.elements.email;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        status.className = 'form-status error';
        status.textContent = 'Please check your email address.';
        email.focus();
        return;
      }
      status.className = 'form-status success';
      status.textContent = 'Thanks. We will be in touch within two business days.';
      form.reset();
    });
  }

  window.addEventListener('load', () => {
    const revealFrames = loadFrames(FRAME_CONFIG_REVEAL);
    const buildFrames = loadFrames(FRAME_CONFIG_BUILD);
    setupCanvas(document.querySelector('#reveal-canvas'), revealFrames, document.querySelector('#reveal'), document.querySelector('.scene-reveal .scene-end'));
    setupCanvas(document.querySelector('#build-canvas'), buildFrames, document.querySelector('#process'), document.querySelector('.scene-build .scene-end'));
    setupStaticAnimations();
    setupProcessSequence();
    setupSceneBadges(document.querySelector('#reveal'));
    setupFeatureHotspots(document.querySelector('#reveal'));
    setupSceneBadges(document.querySelector('#process'));
    setupFeatureHotspots(document.querySelector('#process'));
    setupStatCounters();
    setupSmoothScroll();
    setupNavigation();
    setupForm();
    forceRevealStuckElements();
    window.setTimeout(forceRevealStuckElements, 2000);
    window.setTimeout(forceRevealStuckElements, 4500);
  });
})();