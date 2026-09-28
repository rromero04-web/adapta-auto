(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Cabecera y menú ---------- */
  var header = $("#header");
  var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = $(".nav-toggle");
  var nav = $("#nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Pestañas de adaptaciones ---------- */
  var tabs = $$(".adapt-tab");
  var selectTab = function (tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- Animación al hacer scroll ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Catálogo de vehículos ---------- */
  var data = window.ADAPTA_VEHICULOS || [];
  var cats = window.ADAPTA_CATEGORIAS || {};
  var grid = $("#stock-grid");
  var filtersEl = $("#filters");
  var searchEl = $("#stock-search");
  var state = { cat: "todos", q: "" };

  var illuFor = { furgoneta: "illu-van", turismo: "illu-car", monovolumen: "illu-mono", micro: "illu-micro", taxi: "illu-taxi", asiento: "illu-seat" };

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var fmtNum = function (n) { return new Intl.NumberFormat("es-ES").format(n); };
  var fmtPrice = function (p) {
    return p == null
      ? '<span class="price ask">Precio: consultar</span>'
      : '<span class="price">' + new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p) + "</span>";
  };
  var title = function (v) { return (v.marca + " " + (v.modelo || "")).trim(); };
  var icon = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var media = function (v, i) {
    if (v.fotos && v.fotos.length) {
      return '<img src="' + esc(v.fotos[i || 0]) + '" alt="' + esc(title(v)) + ' adaptado, foto ' + ((i || 0) + 1) + '" loading="lazy">';
    }
    return '<svg class="illu" viewBox="0 0 320 180" aria-hidden="true"><use href="#' + (illuFor[v.tipo] || "illu-van") + '"/></svg>';
  };

  var renderFilters = function () {
    if (!filtersEl) return;
    filtersEl.innerHTML = Object.keys(cats).map(function (k) {
      var n = k === "todos" ? data.length : data.filter(function (v) { return v.categoria === k; }).length;
      if (k !== "todos" && !n) return "";
      return '<button type="button" class="filter" data-cat="' + k + '" aria-pressed="' + (state.cat === k) + '">' +
        esc(cats[k]) + '<span class="count">' + n + "</span></button>";
    }).join("");
  };

  var render = function () {
    if (!grid) return;
    var q = state.q.trim().toLowerCase();
    var list = data.filter(function (v) {
      var inCat = state.cat === "todos" || v.categoria === state.cat;
      var hay = (title(v) + " " + (v.resumen || "") + " " + (v.caracteristicas || []).join(" ")).toLowerCase();
      return inCat && (!q || hay.indexOf(q) !== -1);
    });
    list.sort(function (a, b) { return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); });

    if (!list.length) {
      grid.innerHTML = '<div class="stock-empty"><p><strong>Ahora mismo no hay vehículos en esta categoría.</strong></p>' +
        '<p>El stock cambia a diario. <a href="#contacto">Déjanos tu consulta</a> y te avisamos en cuanto tengamos uno.</p></div>';
      return;
    }

    grid.innerHTML = list.map(function (v) {
      var specs = [];
      if (v.anio) specs.push("<li>" + icon("i-calendar") + v.anio + "</li>");
      if (v.km != null) specs.push("<li>" + icon("i-gauge") + fmtNum(v.km) + " km</li>");
      if (v.plazas) specs.push("<li>" + icon("i-users") + v.plazas + " plazas</li>");
      var nFotos = (v.fotos || []).length;
      return '<article class="car">' +
        '<div class="car-media">' + media(v) +
          '<div class="car-badges">' + (v.destacado ? '<span class="badge hot">Destacado</span>' : "") + '<span class="badge">Garantía 12 meses</span></div>' +
          (nFotos > 1 ? '<span class="car-photos">' + icon("i-camera") + nFotos + "</span>" : "") +
        "</div>" +
        '<div class="car-body">' +
          '<span class="car-cat">' + esc(cats[v.categoria] || "") + "</span>" +
          "<h3>" + esc(title(v)) + "</h3>" +
          (specs.length ? '<ul class="specs">' + specs.join("") + "</ul>" : "") +
          "<p>" + esc(v.resumen) + "</p>" +
          '<div class="car-foot">' + fmtPrice(v.precio) +
            '<button type="button" class="btn btn-outline" data-open="' + esc(v.id) + '">Ver ficha</button>' +
          "</div>" +
        "</div></article>";
    }).join("");
  };

  var setCat = function (cat) {
    state.cat = cats[cat] ? cat : "todos";
    renderFilters();
    render();
  };

  if (filtersEl) {
    filtersEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (b) setCat(b.getAttribute("data-cat"));
    });
  }
  if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value; render(); });
  $$("[data-filter]").forEach(function (a) {
    a.addEventListener("click", function () { setCat(a.getAttribute("data-filter")); });
  });

  renderFilters();
  render();

  /* ---------- Ficha (ventana) ---------- */
  var modal = $("#car-modal");
  var modalBody = $("#modal-body");
  var lastFocus = null;
  var current = null;
  var photo = 0;

  var renderModal = function () {
    var v = current;
    var fotos = v.fotos || [];
    var rows = [
      ["Marca", v.marca],
      ["Modelo", v.modelo],
      ["Categoría", cats[v.categoria]],
      ["Año", v.anio],
      ["Kilómetros", v.km != null ? fmtNum(v.km) + " km" : null],
      ["Plazas", v.plazas],
      ["Garantía", "12 meses (piezas y mano de obra)"],
      ["Entrega", "A domicilio en toda España"],
      ["Referencia", typeof v.id === "number" ? "#" + v.id : null]
    ].filter(function (r) { return r[1] != null && r[1] !== ""; });

    var gallery = '<div class="modal-gallery"><div class="modal-main">' + media(v, photo) +
      (fotos.length > 1
        ? '<button type="button" class="gal-btn prev" data-gal="-1" aria-label="Foto anterior">' + icon("i-left") + "</button>" +
          '<button type="button" class="gal-btn next" data-gal="1" aria-label="Foto siguiente">' + icon("i-right") + "</button>"
        : "") + "</div>" +
      (fotos.length > 1
        ? '<div class="thumbs">' + fotos.map(function (f, i) {
            return '<button type="button" data-thumb="' + i + '" aria-label="Ver foto ' + (i + 1) + '"' + (i === photo ? ' aria-current="true"' : "") + '><img src="' + esc(f) + '" alt=""></button>';
          }).join("") + "</div>"
        : "") + "</div>";

    var asunto = encodeURIComponent("Consulta sobre " + title(v) + (typeof v.id === "number" ? " (ref. " + v.id + ")" : ""));

    modalBody.innerHTML = gallery +
      '<div class="modal-info">' +
        '<span class="car-cat">' + esc(cats[v.categoria] || "") + "</span>" +
        '<h2 id="modal-title">' + esc(title(v)) + "</h2>" +
        fmtPrice(v.precio) +
        '<table class="spec-table"><tbody>' + rows.map(function (r) { return "<tr><th scope=\"row\">" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</tbody></table>" +
        ((v.caracteristicas || []).length ? '<h3 style="font-size:1.05rem">Equipamiento y adaptación</h3><ul class="feat-list">' + v.caracteristicas.map(function (c) { return "<li>" + icon("i-check-circle") + esc(c) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="modal-actions">' +
          '<a class="btn btn-primary" href="tel:+34968603322">' + icon("i-phone") + " Llamar: 968 603 322</a>" +
          '<a class="btn btn-outline" href="mailto:info@adapta-auto.com?subject=' + asunto + '">' + icon("i-mail") + " Pedir información</a>" +
        "</div>" +
        (v.fichaOriginal ? '<a class="modal-link" href="' + esc(v.fichaOriginal) + '" target="_blank" rel="noopener">Ver ficha completa y fotos en la web actual ↗</a>' : "") +
      "</div>";
  };

  var openModal = function (id) {
    current = data.filter(function (v) { return String(v.id) === String(id); })[0];
    if (!current || !modal) return;
    photo = 0;
    lastFocus = document.activeElement;
    renderModal();
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    $("#modal-close").focus();
  };
  var closeModal = function () {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open");
  };

  if (grid) grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open]");
    if (b) openModal(b.getAttribute("data-open"));
  });
  if (modal) {
    modal.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) return closeModal();
      if (e.target.closest("#modal-close")) return closeModal();
      var n = (current.fotos || []).length;
      var g = e.target.closest("[data-gal]");
      if (g && n) { photo = (photo + Number(g.getAttribute("data-gal")) + n) % n; renderModal(); return; }
      var t = e.target.closest("[data-thumb]");
      if (t) { photo = Number(t.getAttribute("data-thumb")); renderModal(); }
    });
    modal.addEventListener("keydown", function (e) {
      var n = current && (current.fotos || []).length;
      if (!n || n < 2) return;
      if (e.key === "ArrowRight") { photo = (photo + 1) % n; renderModal(); }
      if (e.key === "ArrowLeft") { photo = (photo - 1 + n) % n; renderModal(); }
    });
  }

  /* ---------- Formulario de contacto ---------- */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#form-status");
      var nombre = $("#f-nombre").value.trim();
      var tel = $("#f-tel").value.trim();
      if (!nombre || !tel) { status.style.color = "#c0392b"; status.textContent = "Indica tu nombre y teléfono."; return; }
      if (!$("#f-ok").checked) { status.style.color = "#c0392b"; status.textContent = "Debes aceptar el uso de tus datos."; return; }
      var body = "Nombre: " + nombre + "\nTeléfono: " + tel + "\nEmail: " + $("#f-email").value.trim() +
        "\nMotivo: " + $("#f-motivo").value + "\n\n" + $("#f-msg").value.trim();
      window.location.href = "mailto:info@adapta-auto.com?subject=" + encodeURIComponent("Consulta web: " + $("#f-motivo").value) +
        "&body=" + encodeURIComponent(body);
      status.style.color = "";
      status.textContent = "Abriendo tu programa de correo…";
    });
  }
})();
