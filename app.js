/* ==========================================================================
   Heizung/Sanitär/Klempnerei Unger — app.js
   EINE austauschbare Geschäfts-Konstante (Namen, Adresse, Telefon, E-Mail):
   Ändern Sie die Werte unten, und Formular-Ziel, Erfolgsmeldung und
   Kontaktangaben folgen automatisch. Die statischen Seiten enthalten
   dieselben Werte als Text (siehe BUSINESS-KONSTANTE in style.css).
   ========================================================================== */
const BUSINESS = {
  name: "Heizung/Sanitär/Klempnerei Unger",
  shortName: "Unger Meisterbetrieb",
  owner: "Jens Unger",
  street: "Herrenstraße 8",
  city: "07919 Stadt Pausa-Mühltroff (OT Mühltroff)",
  region: "Vogtlandkreis, Freistaat Sachsen",
  phoneDisplay: "036645 22386",
  phoneHref: "tel:03664522386",
  email: "info@firma-unger.de",
  ustId: "DE352763948",
  chamber: "Handwerkskammer Chemnitz"
};

document.documentElement.classList.add("js");

(function () {
  "use strict";

  /* --- Mobile navigation --- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Reveal-on-scroll (content stays visible without JS) --- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- Hero headline line rise --- */
  document.querySelectorAll(".hero h1 .line span").forEach(function (span, i) {
    setTimeout(function () { span.classList.add("in"); }, reduced ? 0 : 120 + i * 160);
  });

  /* --- Count-up on service numbers --- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    if (reduced) { el.textContent = String(target).padStart(2, "0"); return; }
    var start = null, dur = 900;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased)).padStart(2, "0");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var nums = document.querySelectorAll(".service-num[data-count]");
  if ("IntersectionObserver" in window && nums.length) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); nio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { nio.observe(el); });
  } else {
    nums.forEach(countUp);
  }

  /* --- Anfrageformular: Validierung + Erfolgsstatus (nur Front-End) --- */
  var form = document.getElementById("anfrage-form");
  if (form) {
    var success = document.getElementById("form-success");
    var fields = {
      name: { el: document.getElementById("f-name"), test: function (v) { return v.trim().length >= 2; } },
      phone: { el: document.getElementById("f-phone"), test: function (v) { return v.trim().length >= 5; } },
      email: { el: document.getElementById("f-email"), test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
      gewerk: { el: document.getElementById("f-gewerk"), test: function (v) { return v !== ""; } }
    };
    var consent = document.getElementById("f-consent");

    function setInvalid(input, bad) {
      var field = input.closest(".field") || input.closest(".checkbox-field");
      if (field) field.classList.toggle("invalid", bad);
      if (input.setAttribute) input.setAttribute("aria-invalid", bad ? "true" : "false");
      return !bad;
    }
    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      f.el.addEventListener("blur", function () { setInvalid(f.el, !f.test(f.el.value)); });
      f.el.addEventListener("input", function () {
        var field = f.el.closest(".field");
        if (field && field.classList.contains("invalid") && f.test(f.el.value)) setInvalid(f.el, false);
      });
    });
    if (consent) {
      consent.addEventListener("change", function () { setInvalid(consent, !consent.checked); });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        if (!setInvalid(f.el, !f.test(f.el.value))) ok = false;
      });
      if (consent && !setInvalid(consent, !consent.checked)) ok = false;
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea, .checkbox-field.invalid input");
        if (firstBad) firstBad.focus();
        return;
      }
      /* Front-End only: kein Backend. [PLATZHALTER: Formular-Backend /
         Mailversand an info@firma-unger.de einrichten.] */
      var nameVal = fields.name.el.value.trim();
      var summary = document.getElementById("success-summary");
      if (summary) {
        summary.textContent = "Vielen Dank, " + nameVal + ". Ihre Anfrage ist bei uns eingegangen — wir melden uns schnellstmöglich bei Ihnen. Empfänger: " + BUSINESS.email + ".";
      }
      form.hidden = true;
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
        success.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }
    });
  }
})();
