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
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Animación al aparecer ---------- */
  var observeReveal = function (root) {
    var els = $$(".reveal:not(.is-visible)", root);
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  };
  observeReveal(document);

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
  var yearText = function (v) { return v.nuevo ? "Nuevo" : (v.anio || null); };
  var priceHtml = function (v) {
    if (v.precio == null) return '<span class="price ask">Precio: consultar</span>';
    return '<span class="price">' + fmtEur(v.precio) + (v.iva4 ? "<small>IVA al 4 % incluido</small>" : "") + "</span>";
  };
  var photoHtml = function (v, i, cls) {
    var f = v.fotos && v.fotos[i || 0];
    if (f) return '<img' + (cls ? ' class="' + cls + '"' : "") + ' src="' + esc(f) + '" alt="' + esc(title(v)) + ' adaptado' + (v.fotos.length > 1 ? ", foto " + ((i || 0) + 1) : "") + '" loading="lazy">';
    return '<svg class="illu" viewBox="0 0 320 180" aria-hidden="true"><use href="#' + (ILLU[v.tipo] || "illu-van") + '"/></svg>';
  };
  var badgesHtml = function (v) {
    var b = [];
    if (v.vendido) b.push('<span class="badge dark">Vendido</span>');
    if (v.nuevo) b.push('<span class="badge brand">Nuevo</span>');
    if (v.etiqueta) b.push('<span class="badge">' + esc(v.etiqueta) + "</span>");
    return b.join("");
  };
  var byNewest = function (a, b) { return (a.vendido - b.vendido) || (b.id - a.id); };

  var cardHtml = function (v) {
    var specs = [];
    var y = yearText(v);
    if (y) specs.push("<li>" + icon("i-calendar") + y + "</li>");
    if (v.km != null && !(v.nuevo && !v.km)) specs.push("<li>" + icon("i-gauge") + fmtNum(v.km) + " km</li>");
    if (v.cambio) specs.push("<li>" + icon("i-gear") + esc(v.cambio) + "</li>");
    var url = "vehiculo.html?id=" + v.id;
    return '<article class="car reveal' + (v.vendido ? " is-sold" : "") + '">' +
      '<a class="cover" href="' + url + '" aria-label="Ver ficha: ' + esc(title(v)) + '"></a>' +
      '<div class="car-media">' + photoHtml(v) + '<div class="car-badges">' + badgesHtml(v) + "</div></div>" +
      '<div class="car-body">' +
        '<span class="car-cat">' + esc(CATS[v.categoria] || "") + "</span>" +
        "<h3>" + esc(title(v)) + "</h3>" +
        (specs.length ? '<ul class="specs">' + specs.join("") + "</ul>" : "") +
        (v.adaptacion ? '<p class="car-adapt">' + icon("i-access") + "<span>Adaptación: " + esc(v.adaptacion) + "</span></p>" : "") +
        '<div class="car-foot">' + priceHtml(v) + '<span class="more">Ver ficha ' + icon("i-arrow") + "</span></div>" +
      "</div></article>";
  };

  /* ---------- Portada: destacados y contadores ---------- */
  var featured = $("#featured");
  if (featured) {
    var limit = Number(featured.getAttribute("data-limit")) || 6;
    var list = DATA.filter(function (v) { return !v.vendido && v.fotos && v.fotos.length; })
      .sort(function (a, b) { return (b.anio || 0) - (a.anio || 0) || b.id - a.id; }).slice(0, limit);
    featured.innerHTML = list.map(cardHtml).join("");
    observeReveal(featured);
  }
  $$("[data-count]").forEach(function (el) {
    var n = DATA.filter(function (v) { return v.categoria === el.getAttribute("data-count"); }).length;
    if (n) el.textContent = n + (n === 1 ? " vehículo" : " vehículos"); else el.remove();
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
        return '<button type="button" class="filter" data-cat="' + k + '" aria-pressed="' + (state.cat === k) + '">' + esc(CATS[k]) + '<span class="n">' + n + "</span></button>";
      }).join("");
    };
    var sorters = {
      reciente: byNewest,
      "precio-asc": function (a, b) { return (a.precio == null) - (b.precio == null) || (a.precio - b.precio) || byNewest(a, b); },
      "precio-desc": function (a, b) { return (a.precio == null) - (b.precio == null) || (b.precio - a.precio) || byNewest(a, b); },
      km: function (a, b) { return (a.km == null) - (b.km == null) || (a.km - b.km) || byNewest(a, b); }
    };
    var render = function () {
      var q = state.q.trim().toLowerCase();
      var list = DATA.filter(function (v) {
        if (state.cat !== "todos" && v.categoria !== state.cat) return false;
        if (state.hideSold && v.vendido) return false;
        if (!q) return true;
        var hay = [title(v), v.adaptacion, v.carroceria, v.etiqueta, v.anio, (v.caracteristicas || []).join(" ")].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      }).sort(sorters[state.sort]);

      var avail = list.filter(function (v) { return !v.vendido; }).length;
      resultsEl.innerHTML = "<strong>" + list.length + "</strong> " + (list.length === 1 ? "vehículo" : "vehículos") +
        (list.length ? " · " + avail + " disponible" + (avail === 1 ? "" : "s") : "");
      titleEl.textContent = state.cat === "todos" ? "Vehículos adaptados" : CATS[state.cat];
      document.title = (state.cat === "todos" ? "Vehículos adaptados en venta" : CATS[state.cat] + " · Vehículos adaptados") + " · Adapta Auto";

      if (!list.length) {
        var msg = state.cat === "alquiler"
          ? "Consúltanos la disponibilidad de vehículos adaptados de alquiler."
          : "Prueba con otra búsqueda o cuéntanos qué necesitas: el stock cambia a diario.";
        stock.innerHTML = '<div class="empty"><strong>No hay vehículos que mostrar</strong><p>' + msg + '</p><a class="btn btn-primary btn-sm" href="contacto.html#formulario">Consultar</a></div>';
        return;
      }
      stock.innerHTML = list.map(cardHtml).join("");
      observeReveal(stock);
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
      renderFilters(); render(); syncUrl();
    });
    qEl.addEventListener("input", function () { state.q = qEl.value; render(); syncUrl(); });
    sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(); });
    soldEl.addEventListener("change", function () { state.hideSold = soldEl.checked; render(); });

    renderFilters();
    render();
  }

  /* ---------- Ficha de vehículo ---------- */
  var detail = $("#detail");
  if (detail) {
    var id = new URLSearchParams(location.search).get("id");
    var v = DATA.filter(function (x) { return String(x.id) === String(id); })[0];

    if (!v) {
      detail.innerHTML = '<div class="empty"><strong>No hemos encontrado este vehículo</strong><p>Puede que ya no esté disponible.</p><a class="btn btn-primary btn-sm" href="vehiculos.html">Ver todos los vehículos</a></div>';
    } else {
      var name = title(v);
      document.title = name + " adaptado · Adapta Auto";
      $("#crumb-name").textContent = name;
      var crumb = $("#crumb-cat");
      crumb.textContent = CATS[v.categoria] || "Vehículos";
      crumb.href = "vehiculos.html?cat=" + v.categoria;

      var rows = [
        ["Marca", v.marca], ["Modelo", v.modelo], ["Año", yearText(v)],
        ["Kilómetros", v.km != null && !(v.nuevo && !v.km) ? fmtNum(v.km) + " km" : null],
        ["Motor", v.motor], ["Caja de cambios", v.cambio], ["Carrocería", v.carroceria],
        ["Adaptación", v.adaptacion], ["Largo total", v.largo], ["Alto total", v.alto],
        ["Categoría", CATS[v.categoria]], ["Referencia", "#" + v.id]
      ].filter(function (r) { return r[1] != null && r[1] !== ""; });

      var fotos = v.fotos || [];
      var asunto = encodeURIComponent("Información sobre " + name + " (ref. " + v.id + ")");

      detail.innerHTML =
        '<div class="detail">' +
          '<div class="d-gallery">' +
            '<div class="gallery-main" id="gal">' + "</div>" +
            (fotos.length > 1 ? '<div class="thumbs" id="thumbs">' + fotos.map(function (f, i) {
              return '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(f) + '" alt=""></button>';
            }).join("") + "</div>" : "") +
          "</div>" +
          '<div class="detail-body">' +
              ((v.caracteristicas || []).length ? "<section><h2>Equipamiento</h2><ul class=\"chips\">" + v.caracteristicas.map(function (c) { return "<li>" + icon("i-check") + esc(c) + "</li>"; }).join("") + "</ul></section>" : "") +
              ((v.descripcion || []).length ? '<section class="desc"><h2>Descripción y adaptación</h2>' + v.descripcion.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>" : "") +
          "</div>" +
          '<aside class="detail-aside">' +
            '<div class="panel">' +
              '<span class="car-cat">' + esc(CATS[v.categoria] || "") + "</span>" +
              "<h1>" + esc(name) + "</h1>" +
              '<p class="sub">' + [yearText(v), v.km != null && !(v.nuevo && !v.km) ? fmtNum(v.km) + " km" : null, v.cambio].filter(Boolean).map(esc).join(" · ") + "</p>" +
              (v.vendido ? '<div class="sold-note">' + icon("i-info") + "<span>Este vehículo está vendido. Consúltanos vehículos similares: el stock cambia a diario.</span></div>" : priceHtml(v)) +
              '<div class="actions">' +
                '<a class="btn btn-primary" href="tel:+34968603322">' + icon("i-phone") + " Llamar: 968 603 322</a>" +
                '<a class="btn btn-outline" href="tel:+34699934166">' + icon("i-mobile") + " Móvil: 699 934 166</a>" +
                '<a class="btn btn-dark" href="mailto:info@adapta-auto.com?subject=' + asunto + '">' + icon("i-mail") + " ¿Quieres más información?</a>" +
              "</div>" +
            "</div>" +
            '<section class="panel"><h2>Ficha técnica</h2><table class="spec-table"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</tbody></table></section>" +
            '<div class="panel"><ul class="perks">' +
              "<li>" + icon("i-shield") + "12 meses de garantía en piezas y mano de obra</li>" +
              "<li>" + icon("i-check-circle") + "Revisado, transferido y homologado</li>" +
              "<li>" + icon("i-truck") + "Entrega a domicilio en toda España</li>" +
            "</ul></div>" +
          "</aside>" +
        "</div>";

      var gal = $("#gal"), cur = 0;
      var showPhoto = function (i) {
        cur = i;
        var html = '<div class="badges">' + badgesHtml(v) + "</div>";
        if (fotos.length) {
          html += '<img class="blur" src="' + esc(fotos[i]) + '" alt="">' + photoHtml(v, i);
          if (fotos.length > 1) {
            html += '<button type="button" class="gal-btn prev" data-step="-1" aria-label="Foto anterior">' + icon("i-left") + "</button>" +
              '<button type="button" class="gal-btn next" data-step="1" aria-label="Foto siguiente">' + icon("i-right") + "</button>" +
              '<span class="gal-count">' + (i + 1) + " / " + fotos.length + "</span>";
          }
        } else {
          html += photoHtml(v);
        }
        gal.innerHTML = html;
        $$("#thumbs button").forEach(function (b, j) { b.setAttribute("aria-current", String(j === i)); });
      };
      showPhoto(0);
      gal.addEventListener("click", function (e) {
        var b = e.target.closest("[data-step]");
        if (b) showPhoto((cur + Number(b.getAttribute("data-step")) + fotos.length) % fotos.length);
      });
      var thumbs = $("#thumbs");
      if (thumbs) thumbs.addEventListener("click", function (e) {
        var b = e.target.closest("[data-i]");
        if (b) showPhoto(Number(b.getAttribute("data-i")));
      });
      document.addEventListener("keydown", function (e) {
        if (fotos.length < 2 || /input|textarea|select/i.test(document.activeElement.tagName)) return;
        if (e.key === "ArrowRight") showPhoto((cur + 1) % fotos.length);
        if (e.key === "ArrowLeft") showPhoto((cur - 1 + fotos.length) % fotos.length);
      });

      var related = DATA.filter(function (x) { return x.id !== v.id && x.categoria === v.categoria; }).sort(byNewest).slice(0, 3);
      if (related.length) {
        $("#related").innerHTML = related.map(cardHtml).join("");
        $("#related-all").href = "vehiculos.html?cat=" + v.categoria;
        $("#related-wrap").hidden = false;
        observeReveal($("#related"));
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
      var fail = function (m) { status.className = "form-status error"; status.textContent = m; };
      if (!val("#f-nombre") || !val("#f-tel")) return fail("Indica tu nombre y teléfono.");
      if (!val("#f-msg")) return fail("Escribe tu mensaje.");
      if (!$("#f-ok").checked) return fail("Debes aceptar la política de privacidad.");
      var body = "Nombre: " + val("#f-nombre") + "\nTeléfono: " + val("#f-tel") + "\nEmail: " + val("#f-email") +
        "\nMotivo: " + val("#f-motivo") + "\n\n" + val("#f-msg");
      window.location.href = "mailto:info@adapta-auto.com?subject=" + encodeURIComponent("Consulta web: " + val("#f-motivo")) + "&body=" + encodeURIComponent(body);
      status.className = "form-status";
      status.textContent = "Abriendo tu programa de correo…";
    });
  }
})();
