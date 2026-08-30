(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     Hero word-stagger animation
  ========================================================= */
  function initHeroWords() {
    const words = document.querySelectorAll(".hero-title .word");
    words.forEach((word, i) => {
      // Headline is step 1 of the hero stagger (80ms), then each word
      // follows on a tighter beat so the line still reads as one motion.
      word.style.animationDelay = `${0.08 + i * 0.05}s`;
    });
  }

  /* =========================================================
     Nav: scroll state, mobile toggle, active link, smooth close
  ========================================================= */
  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  /* =========================================================
     Scroll progress bar + back-to-top
  ========================================================= */
  function initScrollChrome() {
    const bar = document.getElementById("progressBar");
    const backToTop = document.getElementById("backToTop");

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
      backToTop.classList.toggle("visible", scrollTop > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* =========================================================
     IntersectionObserver reveal-on-scroll
  ========================================================= */
  function initReveals() {
    const els = document.querySelectorAll(".reveal-up");
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     Counter animations
  ========================================================= */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const startTime = performance.now();
    const isInt = Number.isInteger(target);

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (isInt ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = (isInt ? target : target.toFixed(1)) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) {
      counters.forEach((el) => animateCounter(el));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     Cursor-following orb (hero only)
  ========================================================= */
  function initCursorOrb() {
    const orb = document.getElementById("cursorOrb");
    const hero = document.querySelector(".hero");
    if (!orb || !hero || prefersReducedMotion) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let active = false;

    hero.addEventListener("mouseenter", () => {
      active = true;
      orb.classList.add("visible");
    });
    hero.addEventListener("mouseleave", () => {
      active = false;
      orb.classList.remove("visible");
    });
    hero.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function loop() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (active) {
        orb.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* =========================================================
     Canvas mesh gradient / particle field background
  ========================================================= */
  function initMeshCanvas() {
    const canvas = document.getElementById("meshCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;

    // Lighter than the accent and kept faint, so the hero background
    // reads as atmosphere rather than a second brand colour.
    const AMBIENT = "140, 165, 255";
    const colors = [
      `rgba(${AMBIENT}, 0.11)`,
      `rgba(${AMBIENT}, 0.09)`,
      `rgba(${AMBIENT}, 0.06)`,
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const blobCount = 5;
    const blobs = Array.from({ length: blobCount }, (_, i) => ({
      baseX: Math.random(),
      baseY: Math.random() * 0.7,
      r: 220 + Math.random() * 220,
      color: colors[i % colors.length],
      speed: 0.06 + Math.random() * 0.05,
      offset: Math.random() * Math.PI * 2,
      driftX: 0.12 + Math.random() * 0.08,
      driftY: 0.1 + Math.random() * 0.08,
    }));

    let particles = [];
    function initParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: 0.08 + Math.random() * 0.16,
      }));
    }

    let t = 0;
    let rafId;

    function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, width, height);

      // gradient mesh blobs: soft pastel washes over the white background
      ctx.globalCompositeOperation = "source-over";
      blobs.forEach((b) => {
        const x = (b.baseX + Math.sin(t * b.speed + b.offset) * b.driftX) * width;
        const y = (b.baseY + Math.cos(t * b.speed + b.offset) * b.driftY) * height;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // particles
      ctx.globalCompositeOperation = "source-over";
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${AMBIENT}, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      initParticles();
      cancelAnimationFrame(rafId);
      if (prefersReducedMotion) {
        // draw a single static frame
        draw();
        cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });

    // Pause when hero is off-screen to save cycles
    const hero = document.querySelector(".hero");
    if ("IntersectionObserver" in window && hero) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!prefersReducedMotion) {
                cancelAnimationFrame(rafId);
                draw();
              }
            } else {
              cancelAnimationFrame(rafId);
            }
          });
        },
        { threshold: 0 }
      );
      io.observe(hero);
    }

    start();
  }

  /* =========================================================
     How It Works: tabs (WAI-ARIA tabs pattern)
     Roving tabindex so Tab enters/leaves the set once, and arrow
     keys move between tabs. Panels are toggled with [hidden] so
     inactive content is hidden from assistive tech, not just
     visually.
  ========================================================= */
  function initProcessTabs() {
    const tablist = document.querySelector(".proc-tabs");
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function select(index, { focus = true } = {}) {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = !active;
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i, { focus: false }));
    });

    tablist.addEventListener("keydown", (e) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      let next = null;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next);
    });
  }

  /* =========================================================
     FAQ accordion
     Only one answer stays open at a time. <details> keeps the markup
     working without JS; here we take over the toggle so the panel can
     animate its height both ways instead of snapping.
  ========================================================= */
  function initFaq() {
    const items = Array.from(document.querySelectorAll(".faq-item"));
    if (!items.length) return;

    const OPEN_MS = 380;
    const CLOSE_MS = 280;

    function panelOf(item) {
      return item.querySelector(".faq-answer");
    }

    function expand(item) {
      const panel = panelOf(item);
      if (item._anim) item._anim.cancel();
      item.open = true;
      if (prefersReducedMotion) return;
      item._anim = panel.animate(
        [
          { height: "0px", opacity: 0 },
          { height: panel.scrollHeight + "px", opacity: 1 },
        ],
        { duration: OPEN_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
      item._anim.onfinish = () => {
        item._anim = null;
      };
    }

    function collapse(item) {
      const panel = panelOf(item);
      if (item._anim) item._anim.cancel();
      if (prefersReducedMotion) {
        item.open = false;
        return;
      }
      item._anim = panel.animate(
        [
          { height: panel.scrollHeight + "px", opacity: 1 },
          { height: "0px", opacity: 0 },
        ],
        { duration: CLOSE_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
      );
      item._anim.onfinish = () => {
        item.open = false;
        item._anim = null;
      };
    }

    items.forEach((item) => {
      const summary = item.querySelector("summary");
      summary.addEventListener("click", (e) => {
        // Take over from the native toggle so closing can animate too.
        e.preventDefault();
        if (item.open) {
          collapse(item);
          return;
        }
        items.forEach((other) => {
          if (other !== item && other.open) collapse(other);
        });
        expand(item);
      });
    });
  }

  /* =========================================================
     Card tilt + cursor-tracked glow
     Pointer-only: skipped for touch and reduced motion, where a tilt
     is either impossible to aim or unwelcome.
  ========================================================= */
  function initCardTilt() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const MAX_TILT = 3; // degrees
    const cards = document.querySelectorAll(".svc-card, .buyer-lead-item");

    cards.forEach((card) => {
      let frame = null;

      card.addEventListener("pointermove", (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          card.style.setProperty("--rx", ((0.5 - py) * MAX_TILT * 2).toFixed(2) + "deg");
          card.style.setProperty("--ry", ((px - 0.5) * MAX_TILT * 2).toFixed(2) + "deg");
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          card.classList.add("is-tilting");
        });
      });

      card.addEventListener("pointerleave", () => {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* =========================================================
     Contact form (client-side only demo submit)
  ========================================================= */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    const note = document.getElementById("formNote");
    const submitBtn = document.getElementById("submitBtn");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const label = submitBtn.querySelector(".btn-label");
      submitBtn.disabled = true;
      label.textContent = "Sending...";

      // Simulated send. Wire this up to your backend / form endpoint.
      setTimeout(() => {
        label.textContent = "Request Sent ✓";
        note.textContent = "Thanks. We will reply within one business day.";
        note.style.color = "var(--success)";
        form.reset();
        setTimeout(() => {
          submitBtn.disabled = false;
          label.textContent = "Book a Free Audit";
        }, 3000);
      }, 900);
    });
  }

  /* =========================================================
     Misc
  ========================================================= */
  function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroWords();
    initNav();
    initScrollChrome();
    initReveals();
    initCounters();
    initCursorOrb();
    initMeshCanvas();
    initProcessTabs();
    initFaq();
    initCardTilt();
    initContactForm();
    initFooterYear();
  });
})();
