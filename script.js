const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const siteHeader = document.querySelector(".site-header");
const heroSection = document.querySelector(".hero");

function syncHeaderScrollState() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 16);

  if (!heroSection) {
    return;
  }

  const headerHeight = siteHeader.offsetHeight;
  const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
  const isOnLight = window.scrollY + headerHeight >= heroBottom - 24;

  siteHeader.classList.toggle("is-on-light", isOnLight);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

syncHeaderScrollState();
window.addEventListener("scroll", syncHeaderScrollState, { passive: true });

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const testimonialCards = Array.from(document.querySelectorAll(".testimonial-card"));
const sliderDots = document.getElementById("slider-dots");
const prevButton = document.getElementById("prev-testimonial");
const nextButton = document.getElementById("next-testimonial");
let activeIndex = 0;
let autoplayId;

function renderTestimonials(index) {
  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });

  const dots = sliderDots ? sliderDots.querySelectorAll("button") : [];
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
  });
}

function goToTestimonial(index) {
  activeIndex = (index + testimonialCards.length) % testimonialCards.length;
  renderTestimonials(activeIndex);
}

function startAutoplay() {
  if (testimonialCards.length < 2) {
    return;
  }

  autoplayId = window.setInterval(() => {
    goToTestimonial(activeIndex + 1);
  }, 5500);
}

function resetAutoplay() {
  window.clearInterval(autoplayId);
  startAutoplay();
}

if (testimonialCards.length && sliderDots) {
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Afficher le temoignage ${index + 1}`);
    dot.addEventListener("click", () => {
      goToTestimonial(index);
      resetAutoplay();
    });
    sliderDots.appendChild(dot);
  });

  renderTestimonials(activeIndex);
  startAutoplay();
}

prevButton?.addEventListener("click", () => {
  goToTestimonial(activeIndex - 1);
  resetAutoplay();
});

nextButton?.addEventListener("click", () => {
  goToTestimonial(activeIndex + 1);
  resetAutoplay();
});

const quizForm = document.getElementById("quiz-form");
const quizResult = document.getElementById("quiz-result");

if (quizForm && quizResult) {
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(quizForm);
    const values = ["question1", "question2", "question3", "question4"].map((key) =>
      Number(formData.get(key) || 0)
    );

    if (values.some((value) => value === 0)) {
      quizResult.textContent = "Complete les 4 questions pour obtenir ton profil.";
      return;
    }

    const score = values.reduce((total, value) => total + value, 0);

    if (score >= 10) {
      quizResult.textContent =
        "Ton profil semble tres bien correspondre au BUT MT2E : curieux, concret et sensible aux enjeux energetiques.";
    } else if (score >= 7) {
      quizResult.textContent =
        "Le BUT MT2E peut clairement t'interesser. Une visite ou un entretien t'aidera a confirmer ton projet.";
    } else {
      quizResult.textContent =
        "Tu es peut-etre encore en phase de decouverte. Echange avec l'equipe pour voir si la formation te correspond.";
    }
  });
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("name-error"),
      validate: (value) => {
        if (!value.trim()) {
          return "Merci de renseigner ton nom.";
        }
        return "";
      },
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("email-error"),
      validate: (value) => {
        const trimmed = value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!trimmed) {
          return "Merci de renseigner ton email.";
        }

        if (!emailPattern.test(trimmed)) {
          return "Merci de saisir une adresse email valide.";
        }

        return "";
      },
    },
    request: {
      input: document.getElementById("request"),
      error: document.getElementById("request-error"),
      validate: () => "",
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("message-error"),
      validate: (value) => {
        if (!value.trim()) {
          return "Merci de renseigner ton message.";
        }
        return "";
      },
    },
  };

  const successMessage = document.getElementById("form-success");

  function setFieldState(fieldConfig, errorMessage) {
    fieldConfig.error.textContent = errorMessage;
    fieldConfig.input.setAttribute("aria-invalid", errorMessage ? "true" : "false");
  }

  function validateField(fieldConfig) {
    const errorMessage = fieldConfig.validate(fieldConfig.input.value);
    setFieldState(fieldConfig, errorMessage);
    return !errorMessage;
  }

  Object.values(fields).forEach((fieldConfig) => {
    fieldConfig.input.addEventListener("input", () => {
      validateField(fieldConfig);
      successMessage.textContent = "";
    });

    fieldConfig.input.addEventListener("blur", () => {
      validateField(fieldConfig);
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    successMessage.textContent = "";

    const results = Object.values(fields).map((fieldConfig) => validateField(fieldConfig));
    const isValid = results.every(Boolean);

    if (!isValid) {
      return;
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      request: String(formData.get("request") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      createdAt: new Date().toISOString(),
    };

    const existingMessages = JSON.parse(localStorage.getItem("mt2eMessages") || "[]");
    existingMessages.push(payload);
    localStorage.setItem("mt2eMessages", JSON.stringify(existingMessages));

    successMessage.textContent =
      "Merci, ta demande a bien ete envoyee. Nous reviendrons vers toi rapidement.";
    contactForm.reset();

    Object.values(fields).forEach((fieldConfig) => {
      setFieldState(fieldConfig, "");
    });
  });
}

const partnersViewport = document.getElementById("partners-viewport");
const partnersPrev = document.getElementById("partners-prev");
const partnersNext = document.getElementById("partners-next");

function scrollPartners(direction) {
  if (!partnersViewport) {
    return;
  }

  const firstCard = partnersViewport.querySelector(".partner-card");
  const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : partnersViewport.clientWidth;
  const computedGap = firstCard ? Number.parseFloat(window.getComputedStyle(firstCard.parentElement).gap || "16") : 16;
  const scrollAmount = cardWidth + computedGap;

  partnersViewport.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth",
  });
}

partnersPrev?.addEventListener("click", () => {
  scrollPartners(-1);
});

partnersNext?.addEventListener("click", () => {
  scrollPartners(1);
});
