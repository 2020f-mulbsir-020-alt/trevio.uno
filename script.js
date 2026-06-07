(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Memory Scan Entry ── */
  const scanSection = document.getElementById('memory-scan');
  const enterBtn = document.getElementById('enter-system');

  if (scanSection && enterBtn) {
    document.body.classList.add('scan-active');

    enterBtn.addEventListener('click', () => {
      scanSection.classList.add('scan-complete');
      document.body.classList.remove('scan-active');

      setTimeout(() => {
        const memories = document.getElementById('memories');
        if (memories) {
          memories.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }, prefersReducedMotion ? 100 : 800);
    });

    setTimeout(() => {
      if (document.body.classList.contains('scan-active')) {
        enterBtn.style.opacity = '1';
      }
    }, 3000);
  }

  /* ── Scroll Reveal ── */
  const revealElements = document.querySelectorAll(
    '.section-header, .memory-frame, .echo, .film-strip, .vault-memory, .route-card, .contact-form'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ── Memory Frame Touch Support ── */
  const memoryFrames = document.querySelectorAll('.memory-frame');

  memoryFrames.forEach((frame) => {
    frame.addEventListener('click', () => {
      memoryFrames.forEach((f) => f.classList.remove('frame-active'));
      frame.classList.add('frame-active');
    });
  });

  /* ── Time River Scroll Activation ── */
  const riverContainer = document.querySelector('.river-container');
  const riverEvents = document.querySelectorAll('.river-event');
  const riverMemories = document.querySelector('.river-memories');

  if (riverMemories && riverEvents.length) {
    const activateRiverEvent = () => {
      const containerRect = riverMemories.getBoundingClientRect();
      const center = containerRect.left + containerRect.width / 2;

      let closest = null;
      let closestDist = Infinity;

      riverEvents.forEach((event) => {
        const rect = event.getBoundingClientRect();
        const eventCenter = rect.left + rect.width / 2;
        const dist = Math.abs(center - eventCenter);

        if (dist < closestDist) {
          closestDist = dist;
          closest = event;
        }
      });

      riverEvents.forEach((e) => e.classList.remove('river-active'));
      if (closest) closest.classList.add('river-active');
    };

    riverMemories.addEventListener('scroll', activateRiverEvent, { passive: true });
    activateRiverEvent();
  }

  if (riverContainer) {
    const riverScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && riverMemories) {
            const scrollAmount = entry.intersectionRatio * 200;
            riverMemories.scrollLeft += scrollAmount * 0.1;
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    riverScrollObserver.observe(riverContainer);
  }

  /* ── Destination Echoes ── */
  const echoes = document.querySelectorAll('.echo');

  echoes.forEach((echo) => {
    echo.addEventListener('click', () => {
      const echoId = echo.dataset.echo;
      const layers = document.getElementById(`echo-${echoId}-layers`);
      const isExpanded = echo.getAttribute('aria-expanded') === 'true';

      echoes.forEach((e) => {
        e.setAttribute('aria-expanded', 'false');
        const id = e.dataset.echo;
        const l = document.getElementById(`echo-${id}-layers`);
        if (l) l.hidden = true;
      });

      if (!isExpanded && layers) {
        echo.setAttribute('aria-expanded', 'true');
        layers.hidden = false;
      }
    });
  });

  /* ── Sound Canvas Waves ── */
  const soundCanvas = document.getElementById('sound-canvas');
  const soundMemories = document.querySelectorAll('.sound-memory');
  const soundLabels = document.querySelectorAll('.sound-label');
  const soundSection = document.querySelector('.section--sound');

  if (soundCanvas && soundSection) {
    const ctx = soundCanvas.getContext('2d');
    let animationId = null;
    let scrollProgress = 0;
    let isVisible = false;

    let canvasW = 0;
    let canvasH = 0;

    const resizeCanvas = () => {
      const rect = soundCanvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasW = rect.width;
      canvasH = rect.height;
      soundCanvas.width = canvasW * dpr;
      soundCanvas.height = canvasH * dpr;
      soundCanvas.style.width = canvasW + 'px';
      soundCanvas.style.height = canvasH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawWaves = (time) => {
      if (!isVisible) return;

      const w = canvasW;
      const h = canvasH;
      ctx.clearRect(0, 0, w, h);

      const intensity = 0.3 + scrollProgress * 0.7;
      const layers = 4;

      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath();
        const amplitude = (15 + layer * 10) * intensity;
        const frequency = 0.005 + layer * 0.002 + scrollProgress * 0.003;
        const phase = time * 0.001 + layer * 1.5 + scrollProgress * 3;
        const yBase = h * (0.3 + layer * 0.12);

        for (let x = 0; x <= w; x += 2) {
          const landscape = Math.sin(x * 0.003 + scrollProgress * 2) * 20;
          const y =
            yBase +
            Math.sin(x * frequency + phase) * amplitude +
            Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.3) +
            landscape * scrollProgress;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = 0.15 + layer * 0.08;
        const hue = 25 + scrollProgress * 30;
        ctx.strokeStyle = layer % 2 === 0
          ? `rgba(255, 106, 61, ${alpha})`
          : `rgba(255, 200, 87, ${alpha})`;
        ctx.lineWidth = 1.5 + layer * 0.5;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue}, 40%, 20%, ${0.03 + layer * 0.02})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(drawWaves);
    };

    const updateSoundState = (progress) => {
      scrollProgress = progress;

      soundMemories.forEach((mem) => {
        const threshold = parseFloat(mem.dataset.scroll);
        const range = 0.25;
        mem.classList.toggle('active', Math.abs(progress - threshold) < range);
      });

      soundLabels.forEach((label) => {
        const level = label.dataset.intensity;
        let active = false;
        if (level === 'low' && progress < 0.33) active = true;
        if (level === 'mid' && progress >= 0.33 && progress < 0.66) active = true;
        if (level === 'high' && progress >= 0.66) active = true;
        label.classList.toggle('active', active);
      });
    };

    const soundObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationId) {
            resizeCanvas();
            drawWaves(0);
          } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }

          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const progress = 1 - Math.max(0, Math.min(1, rect.top / window.innerHeight));
            updateSoundState(progress);
          }
        });
      },
      { threshold: Array.from({ length: 20 }, (_, i) => i / 20) }
    );

    soundObserver.observe(soundSection);
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener(
      'scroll',
      () => {
        if (!soundSection) return;
        const rect = soundSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = 1 - Math.max(0, Math.min(1, rect.top / window.innerHeight));
          updateSoundState(progress);
        }
      },
      { passive: true }
    );
  }

  /* ── Light Route Map Drawing ── */
  const routePaths = document.querySelectorAll('.route-path');
  const routeNodes = document.querySelectorAll('.route-node');
  const routeCards = document.querySelectorAll('.route-card');
  const routesSection = document.querySelector('.section--routes');

  if (routesSection) {
    const routeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            routePaths.forEach((path, i) => {
              setTimeout(() => path.classList.add('drawn'), i * 400);
            });
            routeNodes.forEach((node, i) => {
              setTimeout(() => node.classList.add('visible'), 600 + i * 200);
            });
            if (routeCards[0]) routeCards[0].classList.add('active');
          }
        });
      },
      { threshold: 0.3 }
    );

    routeObserver.observe(routesSection);

    routeCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        routeCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  /* ── Memory Vault Opening ── */
  const vaultContainer = document.querySelector('.vault-container');

  if (vaultContainer) {
    const vaultObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.4) {
            vaultContainer.classList.add('vault-open');
          }
        });
      },
      { threshold: [0, 0.2, 0.4, 0.6] }
    );

    vaultObserver.observe(vaultContainer);
  }

  /* ── Reflection Room Interaction ── */
  const reflectionRoom = document.getElementById('reflection-room');
  const reflectionSurfaces = document.querySelectorAll('.reflection-surface');

  if (reflectionRoom) {
    reflectionRoom.addEventListener('mousemove', (e) => {
      const rect = reflectionRoom.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      reflectionSurfaces.forEach((surface, i) => {
        const tiltX = (x - 0.5) * 20;
        const tiltY = (y - 0.5) * 20;
        const offset = (i + 1) * 0.5;

        surface.style.transform = `perspective(600px) rotateY(${tiltX * offset}deg) rotateX(${-tiltY * offset}deg)`;
        surface.style.setProperty('--reflect-angle', `${Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90}deg`);
      });
    });

    reflectionRoom.addEventListener('mouseleave', () => {
      reflectionSurfaces.forEach((surface) => {
        surface.style.transform = '';
      });
    });

    reflectionSurfaces.forEach((surface) => {
      surface.addEventListener('click', () => {
        const emotions = ['Stillness', 'Vastness', 'Melancholy', 'Awe', 'Wonder', 'Longing', 'Peace'];
        const emotionEl = surface.querySelector('.reflection-emotion');
        if (emotionEl) {
          const current = emotionEl.textContent;
          let next;
          do {
            next = emotions[Math.floor(Math.random() * emotions.length)];
          } while (next === current);
          emotionEl.textContent = next;
          emotionEl.style.color = 'var(--accent)';
          setTimeout(() => {
            emotionEl.style.color = '';
          }, 600);
        }
      });
    });
  }

  /* ── Replay Experience ── */
  const replayBtn = document.getElementById('replay-btn');

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      replayBtn.classList.add('replaying');

      document.body.style.transition = 'filter 0.8s ease';
      document.body.style.filter = 'brightness(1.2) saturate(1.3)';

      setTimeout(() => {
        document.body.style.filter = '';
        replayBtn.classList.remove('replaying');

        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        if (scanSection) {
          scanSection.classList.remove('scan-complete');
          document.body.classList.add('scan-active');
        }
      }, prefersReducedMotion ? 500 : 1500);
    });
  }

  /* ── Playback Dial Navigation ── */
  const dialTrigger = document.getElementById('dial-trigger');
  const dialMenu = document.getElementById('dial-menu');
  const dialItems = document.querySelectorAll('.dial-item');

  if (dialTrigger && dialMenu) {
    dialTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dialTrigger.getAttribute('aria-expanded') === 'true';
      dialTrigger.setAttribute('aria-expanded', String(!isOpen));
      dialMenu.hidden = isOpen;
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.playback-dial')) {
        dialTrigger.setAttribute('aria-expanded', 'false');
        dialMenu.hidden = true;
      }
    });

    dialItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        if (target) {
          dialTrigger.setAttribute('aria-expanded', 'false');
          dialMenu.hidden = true;
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialTrigger.getAttribute('aria-expanded') === 'true') {
        dialTrigger.setAttribute('aria-expanded', 'false');
        dialMenu.hidden = true;
        dialTrigger.focus();
      }
    });
  }

  /* ── Contact Form ── */
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.contact-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Memory Uploaded';
      btn.style.background = 'var(--accent)';
      btn.style.color = 'var(--primary)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 2500);
    });
  }

  /* ── Footer Year ── */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ── Active Section Indicator on Dial ── */
  const sections = [
    { id: 'memories', el: document.getElementById('memories') },
    { id: 'time-river', el: document.getElementById('time-river') },
    { id: 'echoes', el: document.getElementById('echoes') },
    { id: 'archive', el: document.getElementById('archive') },
    { id: 'routes', el: document.getElementById('routes') },
    { id: 'vault', el: document.getElementById('vault') },
    { id: 'reflection', el: document.getElementById('reflection') },
    { id: 'horizon', el: document.getElementById('horizon') },
  ].filter((s) => s.el);

  const updateActiveSection = () => {
    const scrollPos = window.scrollY + window.innerHeight / 3;

    let active = sections[0];
    sections.forEach((section) => {
      if (section.el.offsetTop <= scrollPos) {
        active = section;
      }
    });

    dialItems.forEach((item) => {
      const href = item.getAttribute('href');
      item.style.borderColor =
        href === `#${active.id}` ? 'var(--secondary)' : '';
    });
  };

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();

})();
