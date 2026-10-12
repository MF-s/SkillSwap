"use strict";
 
/* ==========================================================
   SkillSwap – shared scripts (index, profile, aboutus, catalog)
   Each init function exits early if its elements are not on
   the current page, so one file works for every page.
   ========================================================== */
 
document.addEventListener("DOMContentLoaded", () => {
  // shared
  initBurgerMenu();
  initReveal();
 
  // index.html
  initCreditCalculator();
  initSearch();
 
  // profile.html
  initProfileTabs();
  initSessions();
  initProfileButtons();
 
  // catalog.html
  initCatalog();
});
 
/* Toast (small notification at the bottom)*/
let toastTimer;
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  // force reflow so the transition restarts on repeated calls
  void toast.offsetWidth;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}
 
/* Mobile menu */
function initBurgerMenu() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (!burger || !nav) return;
 
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
 
  burger.addEventListener("click", () => {
    setOpen(burger.getAttribute("aria-expanded") !== "true");
  });
 
  // close after clicking a link
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
 
  // close with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}
 
/* Fade-in on scroll: any element with [data-reveal] */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
 
  // no animation support / reduced motion -> leave everything visible
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;
 
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
 
  // the class is added here (not in HTML), so the page stays readable without JS
  items.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}
 
/* ==========================================================
   index.html
   ========================================================== */
 
/*Credit calculator */
function initCreditCalculator() {
  const range = document.getElementById("hoursRange");
  const hoursOutput = document.getElementById("hoursOutput");
  const result = document.getElementById("calcResult");
  if (!range || !hoursOutput || !result) return;
 
  const WEEKS_PER_MONTH = 4; // 1 hour taught = 1 TimeCredit
 
  const update = () => {
    const hours = Number(range.value);
    const credits = hours * WEEKS_PER_MONTH;
 
    // slider fill
    const percent = ((hours - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty("--fill", `${percent}%`);
 
    hoursOutput.textContent = `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    result.textContent =
      `${credits} TimeCredits = ${credits} hrs of learning`;
  };
 
  range.addEventListener("input", update);
  update();
}
 
/* Search form*/
function initSearch() {
  const form = document.getElementById("searchForm");
  const learn = document.getElementById("learnInput");
  const teach = document.getElementById("teachInput");
  if (!form || !learn || !teach) return;
 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
 
    const learnValue = learn.value.trim();
    const teachValue = teach.value.trim();
 
    if (!learnValue && !teachValue) {
      learn.focus();
      return;
    }
 
    // Pass the query to the catalog page: catalog.html?learn=...&teach=...
    const params = new URLSearchParams();
    if (learnValue) params.set("learn", learnValue);
    if (teachValue) params.set("teach", teachValue);
    window.location.href = `catalog.html?${params.toString()}`;
  });
}
 
/* ==========================================================
   profile.html
   ========================================================== */
 
/* Tabs (Upcoming Swaps / My Skills / History / Settings)*/
function initProfileTabs() {
  const tabs = Array.from(document.querySelectorAll(".tabs .tab"));
  if (!tabs.length) return;
 
  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
    });
    if (focus) tab.focus();
  };
 
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
 
    // arrow keys move between tabs
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  });
}
 
/* Upcoming sessions: confirm / cancel / reschedule / message */
function initSessions() {
  const list = document.getElementById("sessions");
  const empty = document.getElementById("sessionsEmpty");
  if (!list) return;
 
  const updateEmptyState = () => {
    const hasSessions = list.querySelector("[data-session]");
    if (empty) empty.hidden = Boolean(hasSessions);
  };
 
  list.addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");
    if (!button) return;
 
    const session = button.closest("[data-session]");
    const action = button.dataset.action;
 
    if (action === "confirm") {
      const status = session.querySelector("[data-status]");
      status.className = "status status--confirmed";
      status.innerHTML = '<span class="dot"></span>Confirmed';
      button.remove();
      showToast("Session confirmed");
    }
 
    if (action === "cancel") {
      if (!window.confirm("Cancel this session?")) return;
      session.remove();
      updateEmptyState();
      showToast("Session cancelled");
    }
 
    if (action === "reschedule") {
      // TODO: open a date picker / modal
      showToast("Rescheduling is coming soon");
    }
 
    if (action === "message") {
      // TODO: open chat with the partner
      showToast("Messages are coming soon");
    }
  });
 
  updateEmptyState();
}
 
/* Header buttons of the profile */
function initProfileButtons() {
  const shareBtn = document.getElementById("shareProfileBtn");
  const editBtn = document.getElementById("editProfileBtn");
  const addCredits = document.getElementById("addCreditsBtn");
  const addSkill = document.getElementById("addSkillBtn");
 
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Profile link copied");
      } catch (err) {
        // clipboard is unavailable (e.g. opened as a local file)
        window.prompt("Copy your profile link:", url);
      }
    });
  }
 
  // TODO: replace with real pages / modals
  if (editBtn) editBtn.addEventListener("click", () => showToast("Profile editing is coming soon"));
  if (addCredits) addCredits.addEventListener("click", () => showToast("Adding credits is coming soon"));
  if (addSkill) addSkill.addEventListener("click", () => showToast("Adding skills is coming soon"));
}
 
/* ==========================================================
   catalog.html
   Prototype: the 4 cards are static HTML and are filtered /
   sorted in the browser. Replace with a real API later.
   ========================================================== */
function initCatalog() {
  const results = document.getElementById("results");
  const filtersForm = document.getElementById("filtersForm");
  const searchForm = document.getElementById("catalogSearchForm");
  if (!results || !filtersForm || !searchForm) return;
 
  const cards = Array.from(results.querySelectorAll("[data-spec]"));
  const countEl = document.getElementById("resultsCount");
  const emptyEl = document.getElementById("resultsEmpty");
  const sortSelect = document.getElementById("sortSelect");
  const learnInput = document.getElementById("catalogLearn");
  const teachInput = document.getElementById("catalogTeach");
  const quickButtons = document.querySelectorAll("[data-quick]");
 
  // Until the user touches a filter, every card is shown (matches the design,
  // which pre-selects "Development" but lists all specialists).
  let filtersActive = false;
  let sortActive = false;
 
  // Only the filter groups the user actually changed are applied, so the
  // pre-selected defaults (Development, Weekdays) don't hide everyone else.
  const touched = new Set();
 
  const readFilters = () => {
    const data = new FormData(filtersForm);
    return {
      category: touched.has("category") ? data.get("category") : null,
      level: touched.has("level") ? data.get("level") : "any",
      availability: touched.has("availability") ? data.getAll("availability") : [],
      minRating: touched.has("rating") ? Number(data.get("rating")) : 0,
      learn: learnInput.value.trim().toLowerCase(),
      teach: teachInput.value.trim().toLowerCase(),
    };
  };
 
  const matches = (card, f) => {
    const d = card.dataset;
    if (f.category && d.category !== f.category) return false;
    if (f.level !== "any" && d.level !== f.level) return false;
    if (f.availability.length &&
        !f.availability.some((a) => d.availability.split(" ").includes(a))) return false;
    if (Number(d.rating) < f.minRating) return false;
 
    // "Want to learn" -> people who TEACH it; "Can teach" -> people who WANT to learn it
    if (f.learn && !(d.teaches + "," + d.role).includes(f.learn)) return false;
    if (f.teach && !d.learns.includes(f.teach)) return false;
    return true;
  };
 
  const sortCards = () => {
    const [key, dir] = sortSelect.value.split("-");
    const factor = dir === "asc" ? 1 : -1;
    const value = (card) => {
      if (key === "name") return card.dataset.name;
      return Number(card.dataset[key]);
    };
 
    cards
      .slice()
      .sort((a, b) => {
        const va = value(a);
        const vb = value(b);
        if (typeof va === "string") return va.localeCompare(vb);
        return (va - vb) * factor;
      })
      .forEach((card) => results.insertBefore(card, emptyEl));
  };
 
  const syncQuickButtons = () => {
    const current = touched.has("category") ? filtersForm.elements.category.value : null;
    quickButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.quick === current));
    });
  };
 
  const render = () => {
    if (sortActive) sortCards();
 
    let visible = cards.length;
    if (filtersActive) {
      const f = readFilters();
      visible = 0;
      cards.forEach((card) => {
        const show = matches(card, f);
        card.hidden = !show;
        if (show) visible += 1;
      });
      countEl.textContent = `${visible} ${visible === 1 ? "specialist" : "specialists"}`;
    } else {
      cards.forEach((card) => { card.hidden = false; });
      countEl.textContent = "24 specialists"; // demo number from the design
    }
 
    emptyEl.hidden = visible !== 0;
    syncQuickButtons();
  };
 
  /* filters */
  filtersForm.addEventListener("change", (e) => {
    touched.add(e.target.name);
    filtersActive = true;
    render();
  });
 
  /* search*/
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    filtersActive = true;
    render();
  });
 
  /* sort */
  sortSelect.addEventListener("change", () => {
    sortActive = true;
    render();
  });
 
  /* quick category buttons (Design / Development) */
  quickButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const radio = filtersForm.querySelector(`input[name="category"][value="${btn.dataset.quick}"]`);
      if (!radio) return;
      radio.checked = true;
      touched.add("category");
      filtersActive = true;
      render();
    });
  });
 
  /* reset */
  document.getElementById("resetFilters").addEventListener("click", () => {
    filtersForm.reset();
    searchForm.reset();
    touched.clear();
    filtersActive = false;
    render();
  });
 
  /* propose swap */
  results.addEventListener("click", (e) => {
    const button = e.target.closest("[data-propose]");
    if (!button || button.disabled) return;
 
    const name = button.closest("[data-spec]").dataset.name;
    button.disabled = true;
    button.querySelector("span").textContent = "Request sent";
    showToast(`Swap request sent to ${name}`);
  });
 
  /* pagination (visual only for now) */
  const pagination = document.getElementById("pagination");
  if (pagination) {
    const pageButtons = Array.from(pagination.querySelectorAll("[data-page]"))
      .filter((b) => !isNaN(Number(b.dataset.page)));
    const prev = pagination.querySelector('[data-page="prev"]');
    const next = pagination.querySelector('[data-page="next"]');
 
    const goTo = (index) => {
      pageButtons.forEach((b, i) => {
        const active = i === index;
        b.classList.toggle("is-active", active);
        if (active) b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
      });
      prev.disabled = index === 0;
      next.disabled = index === pageButtons.length - 1;
      // TODO: load the specialists of page pageButtons[index].dataset.page
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
 
    pagination.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      const current = pageButtons.findIndex((b) => b.classList.contains("is-active"));
      if (btn === prev) goTo(Math.max(current - 1, 0));
      else if (btn === next) goTo(Math.min(current + 1, pageButtons.length - 1));
      else goTo(pageButtons.indexOf(btn));
    });
  }
 
  /* prefill from the home page search: catalog.html?learn=...&teach=... */
  const params = new URLSearchParams(window.location.search);
  const learn = params.get("learn");
  const teach = params.get("teach");
  if (learn || teach) {
    learnInput.value = learn || "";
    teachInput.value = teach || "";
    filtersActive = true;
    render();
  }
}
