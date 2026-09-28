(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menú ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#nav");
  if (toggle && nav) {
    var setOpen = function (open, focusToggle) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      if (!open && focusToggle) toggle.focus();
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false, true);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180) setOpen(false); });
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Las líneas de cota se trazan cuando entran en pantalla */
  var drawOnView = function (els, threshold) {
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-drawn"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-drawn"); io.unobserve(en.target); }
      });
    }, { threshold: threshold || 0.3 });
    els.forEach(function (el) { io.observe(el); });
  };
  drawOnView($$(".chain"), 0.35);

  /* ---------- Portada: vistas del plano ---------- */
  var hero = $("#hero");
  if (hero) {
    var views = $$(".view", hero);
    var tabs = $$('.vt[role="tab"]', hero);
    var pauseBtn = $(".vt-pause", hero);
    var current = 0, auto = !reduceMotion, shownAt = 0;
    var holds = { hover: false, focus: false, away: false, hidden: false };

    var sync = function () {
      hero.classList.toggle("is-paused", holds.hover || holds.focus || holds.away || holds.hidden);
      hero.classList.toggle("no-auto", !auto);
      pauseBtn.setAttribute("aria-label", auto ? "Pausar las vistas" : "Reproducir las vistas");
    };
    var hold = function (key, on) { holds[key] = on; sync(); };

    var setFocusable = function (view, on) {
      $$("a, button", view).forEach(function (el) { el.tabIndex = on && el.getAttribute("aria-hidden") !== "true" ? 0 : -1; });
    };

    var go = function (i, byUser) {
      i = (i + views.length) % views.length;
      if (byUser && auto) { auto = false; }
      if (i !== current) {
        var prev = views[current];
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        clearTimeout(prev._leave);
        prev._leave = setTimeout(function () { prev.classList.remove("is-leaving"); }, 650);
        views.forEach(function (v, j) {
          var on = j === i;
          if (on) { v.classList.remove("is-leaving"); v.classList.add("is-active"); }
          v.setAttribute("aria-hidden", String(!on));
          setFocusable(v, on);
        });
        tabs.forEach(function (t, j) {
          t.setAttribute("aria-selected", String(j === i));
          t.tabIndex = j === i ? 0 : -1;
          t.classList.toggle("is-done", j < i);
        });
        current = i;
        shownAt = Date.now();
      }
      sync();
    };

    views.forEach(function (v, j) { setFocusable(v, j === 0); });
    shownAt = Date.now();
    sync();

    // Avance automático: al terminar la barra de progreso de la pestaña activa
    hero.addEventListener("animationend", function (e) {
      if (e.animationName !== "hcProgress" || !auto || !tabs[current].contains(e.target)) return;
      if (Date.now() - shownAt < 2000) return;
      go(current + 1);
    });

    tabs.forEach(function (t, j) { t.addEventListener("click", function () { go(j, true); }); });
    var tablist = $('[role="tablist"]', hero);
    tablist.addEventListener("keydown", function (e) {
      var k = e.key, to = null;
      if (k === "ArrowRight") to = current + 1;
      else if (k === "ArrowLeft") to = current - 1;
      else if (k === "Home") to = 0;
      else if (k === "End") to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      go(to, true);
      tabs[current].focus();
    });
    pauseBtn.addEventListener("click", function () {
      auto = !auto;
      shownAt = Date.now();
      sync();
    });

    // Se detiene mientras se lee el texto o se usan los controles con el ratón, o con el teclado
    $$(".hero-copy, .view-foot, .view-tabs, .stack .ph", hero).forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hold("hover", true); });
      el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hold("hover", false); });
    });
    hero.addEventListener("focusin", function (e) {
      var kb = true;
      try { kb = e.target.matches(":focus-visible"); } catch (err) { kb = true; }
      if (kb) hold("focus", true);
    });
    hero.addEventListener("focusout", function (e) { if (!hero.contains(e.relatedTarget)) hold("focus", false); });
    document.addEventListener("visibilitychange", function () { hold("hidden", document.hidden); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { hold("away", !entries[0].isIntersecting); }, { threshold: 0.2 }).observe(hero);
    }

    // Deslizar con el dedo sobre las vistas
    var stage = $(".views", hero), tx = null, ty = null;
    stage.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (tx == null) return;
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1), true);
      tx = ty = null;
    });

    // El trazado empieza cuando la imagen del primer vehículo está lista
    var ready = function () { hero.classList.add("is-ready"); };
    var firstCar = $(".view.is-active .car > img", hero);
    if (firstCar && firstCar.decode) firstCar.decode().then(ready, ready); else ready();
    setTimeout(ready, 1500);
  }

  /* ---------- Utilidades ---------- */
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var icon = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var fmtNum = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var fmtEur = function (n) { return fmtNum(n) + " €"; };

  var DATA = window.ADAPTA_VEHICULOS || [];
  var CATS = window.ADAPTA_CATEGORIAS || {};
  var ILLU = { furgoneta: "illu-van", taxi: "illu-taxi", monovolumen: "illu-van" };

  var title = function (v) { return (v.marca + " " + (v.modelo || "")).trim(); };
  var yearText = function (v) { return v.nuevo ? "Nuevo" : (v.anio ? String(v.anio) : null); };
  var kmText = function (v) { return v.km != null ? fmtNum(v.km) + " km" : null; };
  // En la lámina basta con el tipo de cambio; la ficha muestra el detalle completo
  var gearShort = function (g) { return !g ? null : /^manual/i.test(g) ? "Manual" : /^autom/i.test(g) ? "Automático" : g; };
  var byNewest = function (a, b) { return (a.vendido - b.vendido) || (b.id - a.id); };
  var available = function (v) { return !v.vendido; };

  // Medidas: «4.733mm», «4.380 mm» o «4.80» (metros) pasan a «4,733 m» / «4,80 m»
  var dim = function (s) {
    if (!s) return null;
    var t = String(s).toLowerCase();
    var m = /mm/.test(t) ? Number(t.replace(/\D/g, "")) / 1000 : parseFloat(t.replace(",", "."));
    if (!m || !isFinite(m)) return null;
    return (/mm/.test(t) ? m.toFixed(3) : m.toFixed(2)).replace(".", ",") + " m";
  };

  var priceHtml = function (v) {
    if (v.vendido) return '<span class="price ask">Consultar similares</span>';
    if (v.precio == null) return '<span class="price ask">Precio: consultar</span>';
    return '<span class="price">' + fmtEur(v.precio) + (v.iva4 ? "<small>IVA al 4 % incluido</small>" : "") + "</span>";
  };
  var photoAlt = function (v) { return (v.fotoOrientativa ? "Imagen orientativa: " : "") + title(v) + " adaptado"; };
  var photoHtml = function (v, cls, lazy) {
    var f = v.fotos && v.fotos[0];
    if (f) return "<img" + (cls ? ' class="' + cls + '"' : "") + ' src="' + esc(f) + '" alt="' + esc(photoAlt(v)) + '"' + (lazy ? ' loading="lazy"' : "") + ' decoding="async">';
    return '<svg class="illu" viewBox="0 0 320 180" aria-hidden="true"><use href="#' + (ILLU[v.tipo] || "illu-van") + '"/></svg>';
  };
  var cell = function (label, value) {
    return '<div><dt class="lbl">' + label + "</dt><dd>" +
      (value ? esc(value) : '<span aria-hidden="true">—</span><span class="sr-only">sin dato</span>') + "</dd></div>";
  };

  /* Lámina de vehículo */
  var cardHtml = function (v, k) {
    var state = [];
    if (v.vendido) state.push('<span class="lbl sold">Vendido</span>');
    if (v.nuevo) state.push('<span class="lbl">Nuevo</span>');
    if (v.etiqueta) state.push('<span class="lbl">' + esc(v.etiqueta) + "</span>");
    return '<article class="vs' + (v.vendido ? " is-sold" : "") + '" style="--k:' + (k || 0) + '">' +
      '<div class="vs-view">' + photoHtml(v, "", true) +
        '<span class="vs-ref lbl">Ref. ' + v.id + "</span>" +
        (state.length ? '<div class="vs-state">' + state.join("") + "</div>" : "") +
        (v.fotoOrientativa ? '<span class="vs-note lbl">Imagen orientativa</span>' : "") +
      "</div>" +
      '<div class="vs-body">' +
        '<h3><a href="vehiculo.html?id=' + v.id + '">' + esc(title(v)) + "</a></h3>" +
        '<dl class="vs-data">' + cell("Año", yearText(v)) + cell("Kilómetros", kmText(v)) + cell("Cambio", gearShort(v.cambio)) + "</dl>" +
        '<p class="vs-adapt"><b>Adaptación:</b> ' + (v.adaptacion ? esc(v.adaptacion) : "consultar") + "</p>" +
        '<div class="vs-foot">' + priceHtml(v) + '<span class="more" aria-hidden="true">Ver ficha ' + icon("i-arrow") + "</span></div>" +
      "</div></article>";
  };

  /* Fila del cuadro de stock */
  var scheduleRow = function (v) {
    var url = "vehiculo.html?id=" + v.id, y = yearText(v), km = kmText(v), g = gearShort(v.cambio);
    var none = '<span aria-hidden="true">—</span><span class="sr-only">sin dato</span>';
    var f = v.fotos && v.fotos[0];
    return "<tr>" +
      '<td class="sc-view"><a href="' + url + '" tabindex="-1" aria-hidden="true">' +
        (f ? '<img src="' + esc(f) + '" alt="" loading="lazy" decoding="async">' : "") + "</a></td>" +
      '<td class="sc-ref num">' + v.id + "</td>" +
      '<th scope="row" class="sc-name"><a href="' + url + '">' + esc(title(v)) + "</a>" +
        (v.adaptacion ? '<span class="sc-adapt">' + esc(v.adaptacion) + "</span>" : "") +
        '<span class="sc-meta">' + ["Ref. " + v.id, y, km].filter(Boolean).map(esc).join(" · ") + "</span>" +
        '<span class="sc-mprice">' + (v.precio == null ? "Precio: consultar" : fmtEur(v.precio) + (v.iva4 ? " <small>IVA al 4 % incluido</small>" : "")) + "</span></th>" +
      '<td class="sc-hide num">' + (y ? esc(y) : none) + "</td>" +
      '<td class="sc-hide num">' + (km ? esc(km) : none) + "</td>" +
      '<td class="sc-hide">' + (g ? esc(g) : none) + "</td>" +
      '<td class="sc-price">' + (v.precio == null ? '<span class="price ask">Consultar</span>' : priceHtml(v)) + "</td>" +
      "</tr>";
  };

  /* ---------- Portada: cuadro de vehículos disponibles y recuentos ---------- */
  var featured = $("#featured");
  if (featured) {
    var limit = Number(featured.getAttribute("data-limit")) || 6;
    $("tbody", featured).innerHTML = DATA.filter(function (v) { return available(v) && !v.fotoOrientativa && v.fotos && v.fotos.length; })
      .sort(function (a, b) { return (b.anio || 0) - (a.anio || 0) || b.id - a.id; })
      .slice(0, limit).map(scheduleRow).join("");
  }
  $$("[data-count]").forEach(function (el) {
    var n = DATA.filter(function (v) { return available(v) && v.categoria === el.getAttribute("data-count"); }).length;
    el.textContent = n ? n + (n === 1 ? " disponible" : " disponibles") : "Consultar";
  });

  /* ---------- Catálogo ---------- */
  var stock = $("#stock");
  if (stock) {
    var params = new URLSearchParams(location.search);
    var state = { cat: CATS[params.get("cat")] ? params.get("cat") : "todos", q: params.get("q") || "", sort: "reciente", hideSold: false };
    var filtersEl = $("#filters"), qEl = $("#q"), sortEl = $("#sort"), soldEl = $("#hide-sold"), resultsEl = $("#results"), titleEl = $("#stock-title");
    qEl.value = state.q;

    var renderFilters = function () {
      filtersEl.innerHTML = Object.keys(CATS).map(function (k) {
        var n = k === "todos" ? DATA.length : DATA.filter(function (v) { return v.categoria === k; }).length;
        return '<button type="button" data-cat="' + k + '" aria-pressed="' + (state.cat === k) + '"><span class="layer" aria-hidden="true"></span>' +
          esc(k === "todos" ? "Todas" : CATS[k]) + '<span class="n">' + n + "</span></button>";
      }).join("");
    };
    var sorters = {
      reciente: byNewest,
      "precio-asc": function (a, b) { return (a.precio == null) - (b.precio == null) || (a.precio - b.precio) || byNewest(a, b); },
      "precio-desc": function (a, b) { return (a.precio == null) - (b.precio == null) || (b.precio - a.precio) || byNewest(a, b); },
      km: function (a, b) { return (a.km == null) - (b.km == null) || (a.km - b.km) || byNewest(a, b); }
    };
    var render = function (redraw) {
      var q = state.q.trim().toLowerCase();
      var list = DATA.filter(function (v) {
        if (state.cat !== "todos" && v.categoria !== state.cat) return false;
        if (state.hideSold && v.vendido) return false;
        if (!q) return true;
        var hay = [title(v), v.adaptacion, v.carroceria, v.etiqueta, v.anio, v.id, (v.caracteristicas || []).join(" ")].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      }).sort(sorters[state.sort]);

      var avail = list.filter(available).length;
      resultsEl.innerHTML = "<strong>" + list.length + "</strong> " + (list.length === 1 ? "vehículo" : "vehículos") +
        (list.length ? " · " + avail + " disponible" + (avail === 1 ? "" : "s") : "");
      titleEl.textContent = state.cat === "todos" ? "Vehículos adaptados" : CATS[state.cat];
      document.title = (state.cat === "todos" ? "Vehículos adaptados en venta" : CATS[state.cat] + " · Vehículos adaptados") + " · Adapta Auto";

      if (!list.length) {
        var msg = state.cat === "alquiler"
          ? "Ahora mismo no hay vehículos de alquiler publicados. Consúltanos la disponibilidad."
          : "Prueba con otra búsqueda o cuéntanos qué necesitas: el stock cambia a diario y buscamos el vehículo por ti.";
        stock.innerHTML = '<div class="vs-empty"><h3>No hay vehículos que mostrar</h3><p>' + msg + "</p>" +
          '<div class="actions"><a class="btn btn-red" href="tel:+34968603322">' + icon("i-phone") + " 968 603 322</a>" +
          '<a class="btn" href="contacto.html#formulario">Escribirnos</a></div></div>';
        return;
      }
      stock.classList.toggle("is-redrawing", !!redraw);
      stock.innerHTML = list.map(cardHtml).join("");
    };
    var syncUrl = function () {
      var p = new URLSearchParams();
      if (state.cat !== "todos") p.set("cat", state.cat);
      if (state.q) p.set("q", state.q);
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    };

    filtersEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.getAttribute("data-cat");
      renderFilters(); render(true); syncUrl();
      var again = $('[data-cat="' + state.cat + '"]', filtersEl);
      if (again) again.focus();
    });
    qEl.addEventListener("input", function () { state.q = qEl.value; render(true); syncUrl(); });
    sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(true); });
    soldEl.addEventListener("change", function () { state.hideSold = soldEl.checked; render(true); });

    renderFilters();
    render();
  }

  /* ---------- Ficha del vehículo ---------- */
  var detail = $("#detail");
  if (detail) {
    var id = new URLSearchParams(location.search).get("id");
    var v = DATA.filter(function (x) { return String(x.id) === String(id); })[0];

    if (!v) {
      detail.innerHTML = '<div class="sheet-pad"><h1>No hemos encontrado este vehículo</h1>' +
        '<p class="lead">Puede que ya se haya vendido o que el enlace no sea correcto. El stock cambia a diario.</p>' +
        '<div class="actions"><a class="btn btn-red" href="vehiculos.html">Ver todos los vehículos ' + icon("i-arrow").replace("<svg", '<svg class="go"') + "</a>" +
        '<a class="btn" href="tel:+34968603322">' + icon("i-phone") + " 968 603 322</a></div></div>";
      $("#crumb-name").textContent = "Vehículo no encontrado";
    } else {
      var name = title(v);
      document.title = name + " adaptado · Ref. " + v.id + " · Adapta Auto";
      $("#crumb-name").textContent = name;
      var crumb = $("#crumb-cat");
      crumb.textContent = CATS[v.categoria] || "Vehículos";
      crumb.href = "vehiculos.html?cat=" + v.categoria;

      var largo = dim(v.largo), alto = dim(v.alto);
      var rows = [
        ["Marca", v.marca], ["Modelo", v.modelo], ["Año", yearText(v)], ["Kilómetros", kmText(v)],
        ["Motor", v.motor], ["Caja de cambios", v.cambio], ["Carrocería", v.carroceria],
        ["Adaptación", v.adaptacion], ["Largo total", largo], ["Alto total", alto], ["Referencia", String(v.id)]
      ].filter(function (r) { return r[1] != null && r[1] !== ""; });

      var fotos = v.fotos || [];
      var asunto = encodeURIComponent("Información sobre " + name + " (ref. " + v.id + ")");
      var sub = [CATS[v.categoria], v.etiqueta].filter(Boolean).map(esc).join(" · ");
      var desc = v.descripcion || [], equip = v.caracteristicas || [];

      var perks = '<ul class="perks-line">' +
        "<li>" + icon("i-shield") + "12 meses de garantía en piezas y mano de obra</li>" +
        "<li>" + icon("i-check-circle") + "Revisado, transferido y homologado</li>" +
        "<li>" + icon("i-truck") + "Entrega a domicilio en toda España</li></ul>";

      detail.innerHTML =
        '<div class="sheet-zones" aria-hidden="true"></div>' +
        '<div class="zone-row" aria-hidden="true"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span></div>' +
        '<span class="sheet-id lbl" aria-hidden="true">Hoja 03 <span>/ 09</span></span>' +
        '<div class="ficha">' +
          '<div class="ficha-view">' +
            '<div class="dims' + (alto ? " has-alto" : "") + '">' +
              '<figure class="view-frame" id="gal">' +
                (fotos.length ? '<img class="bg" src="' + esc(fotos[0]) + '" alt="">' : "") +
                photoHtml(v, "main") +
                '<figcaption class="frame-tag">' + (v.fotoOrientativa ? "Imagen orientativa" : "Vista general") + "</figcaption>" +
                (fotos.length > 1 ? '<button type="button" class="gal-btn prev" data-step="-1" aria-label="Foto anterior">' + icon("i-left") + "</button>" +
                  '<button type="button" class="gal-btn next" data-step="1" aria-label="Foto siguiente">' + icon("i-right") + "</button>" : "") +
              "</figure>" +
              (alto ? '<div class="cota cota-v"><span>Alto ' + esc(alto) + "</span></div>" : "") +
              (largo ? '<div class="cota cota-h"><span>Largo ' + esc(largo) + "</span></div>" : "") +
            "</div>" +
            (fotos.length > 1 ? '<div class="thumbs" id="thumbs">' + fotos.map(function (f, i) {
              return '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"' + (i ? "" : ' aria-current="true"') + '><img src="' + esc(f) + '" alt=""></button>';
            }).join("") + "</div>" : "") +
            (v.fotoOrientativa ? '<p class="caption"><span class="lbl">Imagen orientativa</span> Recreación del modelo y su adaptación. Pídenos fotos reales de este vehículo.</p>' : "") +
            '<section class="ficha-perks" aria-labelledby="h-incluido"><h2 id="h-incluido" class="perks-title">Incluido en la compra</h2>' + perks + "</section>" +
          "</div>" +
          '<div class="ficha-tb">' +
            '<div class="head"><h1>' + esc(name) + "</h1>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + "</div>" +
            '<table class="spec"><caption class="sr-only">Ficha técnica</caption><tbody>' + rows.map(function (r) {
              return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
            }).join("") + "</tbody></table>" +
            '<div class="ficha-price">' +
              (v.vendido
                ? '<p class="ficha-note">' + icon("i-info") + "<span><strong>Este vehículo está vendido.</strong> Consúltanos vehículos similares: el stock cambia a diario.</span></p>"
                : priceHtml(v)) +
              '<div class="actions">' +
                '<a class="btn btn-red" href="tel:+34968603322">' + icon("i-phone") + " Llamar al 968 603 322</a>" +
                '<a class="btn" href="tel:+34699934166">' + icon("i-mobile") + " 699 934 166</a>" +
                '<a class="btn" href="mailto:info@adapta-auto.com?subject=' + asunto + '">' + icon("i-mail") + " Pedir información</a>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        (desc.length || equip.length ? '<div class="ficha-body' + (desc.length && equip.length ? "" : " single") + '">' +
          (desc.length ? '<section class="memoria" aria-labelledby="h-memoria"><h2 id="h-memoria">Descripción y adaptación</h2>' +
            desc.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>" : "") +
          (equip.length ? '<section aria-labelledby="h-equipo"><h2 id="h-equipo">Equipamiento</h2><ol class="bom">' +
            equip.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ol></section>" : "") +
        "</div>" : "");

      // Las cotas del vehículo se trazan cuando la foto está lista
      var dims = $(".dims", detail), main = $(".main", detail);
      var drawDims = function () { requestAnimationFrame(function () { requestAnimationFrame(function () { dims.classList.add("is-drawn"); }); }); };
      if (main && main.tagName === "IMG" && !main.complete) {
        main.addEventListener("load", drawDims, { once: true });
        main.addEventListener("error", drawDims, { once: true });
      } else drawDims();

      if (fotos.length > 1) {
        var gal = $("#gal"), cur = 0;
        var show = function (i) {
          cur = (i + fotos.length) % fotos.length;
          $(".main", gal).src = fotos[cur];
          $(".bg", gal).src = fotos[cur];
          $$("#thumbs button").forEach(function (b, j) { b.setAttribute("aria-current", String(j === cur)); });
        };
        gal.addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b) show(cur + Number(b.getAttribute("data-step"))); });
        $("#thumbs").addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b) show(Number(b.getAttribute("data-i"))); });
      }

      var related = DATA.filter(function (x) { return x.id !== v.id && x.categoria === v.categoria; }).sort(byNewest).slice(0, 3);
      if (related.length) {
        $("#related").innerHTML = related.map(cardHtml).join("");
        $("#related-all").href = "vehiculos.html?cat=" + v.categoria;
        $("#related-wrap").hidden = false;
      }
    }
  }

  /* ---------- Formulario de contacto ---------- */
  var form = $("#formulario");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#form-status");
      var val = function (s) { return $(s).value.trim(); };
      var fail = function (m, field) {
        status.className = "form-status error";
        status.textContent = m;
        if (field) $(field).focus();
      };
      if (!val("#f-nombre")) return fail("Indica tu nombre para saber a quién llamamos.", "#f-nombre");
      if (!val("#f-tel")) return fail("Indica un teléfono de contacto.", "#f-tel");
      if (!val("#f-msg")) return fail("Cuéntanos en el mensaje qué necesitas.", "#f-msg");
      if (!$("#f-ok").checked) return fail("Para enviar la consulta debes aceptar la política de privacidad.", "#f-ok");
      var body = "Nombre: " + val("#f-nombre") + "\nTeléfono: " + val("#f-tel") + "\nEmail: " + val("#f-email") +
        "\nMotivo: " + val("#f-motivo") + "\n\n" + val("#f-msg");
      window.location.href = "mailto:info@adapta-auto.com?subject=" + encodeURIComponent("Consulta web: " + val("#f-motivo")) + "&body=" + encodeURIComponent(body);
      status.className = "form-status";
      status.textContent = "Abriendo tu programa de correo con la consulta preparada…";
    });
  }
})();
