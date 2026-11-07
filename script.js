/**
 * WHITE ODONTOLOGIA - JAVASCRIPT INTERACTIONS
 * Form pre-fill, WhatsApp Routing, Before/After Slider, Smooth Reveal, Mobile Drawer
 */

(() => {
  'use strict';

  // Configurações Oficiais da Clínica
  const WHATSAPP_NUMBER = "5551998777570";
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Ano Atual no Rodapé
  const currentYearEl = $("#currentYear");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Header Scroll Shadow
  const mainHeader = $(".main-header");
  const handleScroll = () => {
    if (window.scrollY > 30) {
      mainHeader.classList.add("scrolled");
    } else {
      mainHeader.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Mobile Navigation Drawer
  const burgerBtn = $("#burgerBtn");
  const navMenu = $("#navMenu");
  const toggleMenu = (open) => {
    const isExpanded = open ?? !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", isExpanded);
    burgerBtn.setAttribute("aria-expanded", String(isExpanded));
    document.body.style.overflow = isExpanded ? "hidden" : "";
  };

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    $$("a", navMenu).forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    document.addEventListener("click", (e) => {
      if (navMenu.classList.contains("open") && !navMenu.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  // Active Menu Link on Scroll
  const navLinks = $$('.nav-menu a[href^="#"]:not(.btn)');
  const sections = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(sec => spyObserver.observe(sec));

  // Scroll Reveal Animations
  const revealElements = $$(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  revealElements.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 3) * 100}ms`;
    revealObserver.observe(el);
  });

  // Animated Numbers in Stats
  const statElements = $$("[data-count]");
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const targetNumber = parseInt(el.dataset.count, 10);
      const isThousands = targetNumber >= 1000;
      const duration = 1400;
      const startTimestamp = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(targetNumber * easeOut);

        if (isThousands) {
          el.textContent = `${current.toLocaleString('pt-BR')}+`;
        } else if (targetNumber === 100) {
          el.textContent = `${current}%`;
        } else {
          el.textContent = `${current}+`;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statElements.forEach(el => countObserver.observe(el));

  // Interactive Before & After Slider
  const comparisonSlider = $("#comparisonSlider");
  const beforeLayer = $("#beforeLayer");
  const sliderHandle = $("#sliderHandle");

  if (comparisonSlider && beforeLayer && sliderHandle) {
    let isDown = false;

    const setPosition = (x) => {
      const rect = comparisonSlider.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0) pos = 0;
      if (pos > 1) pos = 1;
      const percent = pos * 100;
      beforeLayer.style.width = `${percent}%`;
      sliderHandle.style.left = `${percent}%`;
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    };

    comparisonSlider.addEventListener("mousedown", (e) => {
      isDown = true;
      setPosition(e.clientX);
    });

    window.addEventListener("mouseup", () => { isDown = false; });
    window.addEventListener("mousemove", onPointerMove);

    comparisonSlider.addEventListener("touchstart", (e) => {
      isDown = true;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener("touchend", () => { isDown = false; });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
  }

  // Appointment Simulator Form Routing
  const appointmentForm = $("#appointmentForm");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = appointmentForm;
      const nameInput = form.nome;
      const treatmentSelect = form.tratamento;
      const periodSelect = form.periodo;
      const notesInput = form.notas;

      let isValid = true;
      if (!nameInput.value.trim()) {
        nameInput.classList.add("invalid");
        nameInput.focus();
        isValid = false;
      } else {
        nameInput.classList.remove("invalid");
      }

      if (!treatmentSelect.value) {
        treatmentSelect.classList.add("invalid");
        if (isValid) treatmentSelect.focus();
        isValid = false;
      } else {
        treatmentSelect.classList.remove("invalid");
      }

      if (!isValid) return;

      const message = 
`Olá, White Odontologia! Gostaria de agendar uma consulta de avaliação.

👤 *Nome:* ${nameInput.value.trim()}
🦷 *Tratamento Desejado:* ${treatmentSelect.value}
⏰ *Melhor Período:* ${periodSelect.value}
${notesInput.value.trim() ? `📝 *Observação:* ${notesInput.value.trim()}` : ''}

Vi pelo site oficial e gostaria de consultar os próximos horários disponíveis.`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener");
    });
  }

})();
