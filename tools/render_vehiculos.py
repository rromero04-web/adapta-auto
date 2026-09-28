#!/usr/bin/env python3
"""Genera imágenes orientativas (SVG) para vehículos sin foto.

Dibuja una vista lateral de estudio de cada modelo con su adaptación
(plataforma o rampa trasera) y un usuario en silla de ruedas. Todas las
imágenes llevan la marca «Imagen orientativa».

Uso:  python3 tools/render_vehiculos.py
"""
import base64
import io
from pathlib import Path

try:
    from PIL import Image, ImageEnhance, ImageFilter
except ImportError:  # sin Pillow se usa un fondo liso
    Image = None

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fotos" / "orientativas"
BACKDROP = ROOT / "assets" / "img" / "exposicion.jpg"
W, H = 1200, 900
GROUND = 700

PAINT = {
    "blanco": ("#ffffff", "#e9ebee", "#c9cdd3"),
    "plata": ("#eef0f2", "#c7ccd2", "#9aa1aa"),
    "gris": ("#c9ced4", "#8f969f", "#626972"),
}

# Perfiles: proporciones de cada tipo de carrocería (en píxeles del lienzo)
BODY = {
    #            largo  alto  capó  parabrisas  rueda  voladizo_del  voladizo_tras  techo_redondeado
    "furgon":   dict(L=700, Ht=300, hood=95, ws=80, r=56, fo=118, ro=105, round_=18),
    "furgon_m": dict(L=800, Ht=335, hood=100, ws=80, r=58, fo=122, ro=115, round_=16),
    "furgon_h": dict(L=860, Ht=390, hood=95, ws=80, r=60, fo=120, ro=120, round_=14),
    "furgon_l": dict(L=860, Ht=345, hood=95, ws=80, r=60, fo=120, ro=120, round_=18),
    "minibus":  dict(L=900, Ht=340, hood=95, ws=82, r=60, fo=120, ro=125, round_=20),
    "combi":    dict(L=720, Ht=270, hood=120, ws=95, r=54, fo=120, ro=105, round_=26),
    "monovol":  dict(L=690, Ht=235, hood=150, ws=150, r=52, fo=125, ro=105, round_=60),
}


def wheel(cx, cy, r):
    return f'''
  <g>
    <circle cx="{cx}" cy="{cy}" r="{r}" fill="#15171a"/>
    <circle cx="{cx}" cy="{cy}" r="{r*0.64:.1f}" fill="url(#rim)"/>
    <circle cx="{cx}" cy="{cy}" r="{r*0.64:.1f}" fill="none" stroke="#6b7280" stroke-width="2"/>
    {''.join(f'<rect x="{cx-3}" y="{cy-r*0.6:.1f}" width="6" height="{r*0.42:.1f}" rx="3" fill="#8a929c" transform="rotate({a} {cx} {cy})"/>' for a in range(0, 360, 72))}
    <circle cx="{cx}" cy="{cy}" r="{r*0.16:.1f}" fill="#4b5058"/>
  </g>'''


def wheelchair_user(x, y, s=1.0, color="#16171b"):
    """Usuario en silla de ruedas mirando hacia la izquierda (hacia el vehículo)."""
    return f'''
  <g transform="translate({x} {y}) scale({s})" fill="none" stroke="{color}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="0" cy="-58" r="46" stroke-width="9"/>
    <circle cx="0" cy="-58" r="6" fill="{color}" stroke="none"/>
    <circle cx="-62" cy="-22" r="14" stroke-width="8"/>
    <path d="M40 -150 L40 -70 L-40 -70 L-62 -36" stroke-width="9"/>
    <path d="M40 -150 L58 -150" stroke-width="9"/>
    <circle cx="10" cy="-205" r="20" fill="{color}" stroke="none"/>
    <path d="M18 -178 L26 -112 L-30 -108 L-44 -60" stroke-width="22"/>
    <path d="M20 -165 L-18 -140" stroke-width="15"/>
  </g>'''


def van(spec):
    b = BODY[spec["body"]]
    top, mid, low = PAINT[spec["color"]]
    L, Ht, r = b["L"], b["Ht"], b["r"]
    x0 = 150 if spec["adapt"] != "ninguna" else (W - L) // 2
    x1 = x0 + L
    yb = GROUND - r * 0.45           # parte baja de la carrocería
    yt = yb - Ht                      # techo
    fw, rw = x0 + b["fo"], x1 - b["ro"]   # centros de rueda
    hood_y = yb - Ht * (0.5 if spec["body"] in ("monovol",) else 0.56)
    rr = b["round_"]
    ws_x = x0 + b["hood"] + b["ws"]

    # Silueta
    if spec["body"] == "monovol":
        body = (f"M{x0+10},{yb} L{x0},{yb-40} Q{x0},{hood_y+10} {x0+30},{hood_y} "
                f"L{x0+b['hood']},{hood_y-18} Q{ws_x-30},{yt+8} {ws_x+30},{yt} "
                f"L{x1-110},{yt+2} Q{x1-20},{yt+8} {x1-6},{yt+70} L{x1},{yb-30} Q{x1},{yb} {x1-20},{yb} Z")
    else:
        body = (f"M{x0+10},{yb} L{x0},{yb-50} Q{x0},{hood_y+8} {x0+26},{hood_y} "
                f"L{x0+b['hood']},{hood_y-20} L{ws_x-rr},{yt+rr} Q{ws_x},{yt} {ws_x+rr*2},{yt} "
                f"L{x1-rr},{yt} Q{x1},{yt} {x1},{yt+rr} L{x1},{yb-20} Q{x1},{yb} {x1-20},{yb} Z")

    wy1 = yt + (26 if spec["body"] != "monovol" else 22)
    wy2 = hood_y - (6 if spec["body"] != "monovol" else 0)
    glass = []
    # Ventanilla delantera (puerta del conductor)
    d0 = x0 + b["hood"] + 8
    d1 = ws_x + (95 if spec["body"] != "monovol" else 105)
    glass.append(f"M{d0+18},{wy2} L{ws_x-6},{wy1+4} L{d1},{wy1+4} L{d1},{wy2} Z")
    # Ventanillas laterales
    n = spec.get("windows", 0)
    if n:
        gx0, gx1 = d1 + 22, x1 - 26
        step = (gx1 - gx0) / n
        for i in range(n):
            a = gx0 + i * step + 6
            bb = gx0 + (i + 1) * step - 6
            if spec["body"] == "monovol" and i == n - 1:
                glass.append(f"M{a},{wy1+4} L{bb-20},{wy1+8} Q{bb},{wy1+14} {bb+4},{wy2-14} L{bb},{wy2} L{a},{wy2} Z")
            else:
                glass.append(f"M{a},{wy1+4} L{bb},{wy1+4} L{bb},{wy2} L{a},{wy2} Z")

    lines = []
    # Puerta delantera y corredera
    lines.append(f"M{d1+11},{wy1} L{d1+11},{yb-14}")
    lines.append(f"M{d0+6},{wy2} L{d0+6},{yb-30}")
    if spec["body"] != "monovol":
        sl = d1 + 11 + (x1 - d1) * 0.36
        lines.append(f"M{sl},{wy1} L{sl},{yb-14}")
    else:
        sl = d1 + 11 + (x1 - d1) * 0.45
        lines.append(f"M{sl},{wy1+6} L{sl},{yb-14}")
    lines.append(f"M{x0+12},{yb-70} L{x1-8},{yb-70}")  # moldura lateral

    parts = []
    parts.append(f'<ellipse cx="{(x0+x1)/2 + (70 if spec["adapt"]!="ninguna" else 0)}" cy="{GROUND+6}" rx="{L/2+170}" ry="26" fill="url(#shadow)"/>')

    # Rampa / plataforma (detrás del vehículo, se dibuja antes para quedar debajo de la puerta)
    floor_y = yb - (14 if spec["body"] in ("monovol", "combi") else 26)
    if spec["adapt"] == "plataforma":
        px = x1 + 12
        pl = 250
        parts.append(f'''
  <g>
    <rect x="{px-10}" y="{floor_y-6}" width="14" height="{GROUND-floor_y}" fill="#3b4048"/>
    <path d="M{px},{floor_y} L{px+30},{floor_y} L{px+30},{GROUND-26} L{px},{GROUND-26}" fill="none" stroke="#50565f" stroke-width="8"/>
    <rect x="{px}" y="{GROUND-30}" width="{pl}" height="16" rx="3" fill="#8e959e"/>
    <rect x="{px}" y="{GROUND-30}" width="{pl}" height="5" fill="#b8bec6"/>
    <rect x="{px+pl-18}" y="{GROUND-70}" width="10" height="44" rx="3" fill="#f2b705"/>
    <rect x="{px}" y="{GROUND-14}" width="{pl}" height="6" fill="#f2b705"/>
    <path d="M{px+8},{GROUND-120} L{px+pl-40},{GROUND-120}" stroke="#50565f" stroke-width="6" stroke-linecap="round"/>
    <path d="M{px+8},{GROUND-120} L{px+8},{GROUND-30}" stroke="#50565f" stroke-width="6"/>
  </g>''')
        parts.append(wheelchair_user(px + 150, GROUND - 30, 0.78))
    elif spec["adapt"] == "rampa":
        rx0, ry0 = x1 - 4, floor_y
        rx1 = x1 + 240
        parts.append(f'''
  <g>
    <path d="M{rx0},{ry0} L{rx1},{GROUND-4} L{rx1},{GROUND+6} L{rx0},{ry0+12} Z" fill="#8e959e"/>
    <path d="M{rx0},{ry0} L{rx1},{GROUND-4}" stroke="#c3c8cf" stroke-width="5"/>
    <path d="M{rx0+6},{ry0+8} L{rx1},{GROUND+4}" stroke="#f2b705" stroke-width="5"/>
  </g>''')
        parts.append(wheelchair_user(x1 + 185, GROUND - 2, 0.72))

    # Carrocería
    parts.append(f'<path d="{body}" fill="url(#paint)" stroke="{low}" stroke-width="3"/>')
    parts.append(f'<path d="{body}" fill="url(#sheen)"/>')
    for g in glass:
        parts.append(f'<path d="{g}" fill="url(#glass)" stroke="#0d0f12" stroke-width="3"/>')
    parts.append(f'<path d="M{d1+30},{wy1+10} L{d1+90},{wy1+10} L{d1+40},{wy2-4} L{d1+22},{wy2-4} Z" fill="#ffffff" opacity=".10"/>')
    for ln in lines:
        parts.append(f'<path d="{ln}" stroke="{low}" stroke-width="3" fill="none"/>')
    # Paso de rueda
    for cx in (fw, rw):
        parts.append(f'<path d="M{cx-r-14},{yb} A{r+14},{r+14} 0 0 1 {cx+r+14},{yb} Z" fill="#1d1f23"/>')
    # Parachoques, faros, pilotos, retrovisor, manetas
    parts.append(f'<rect x="{x0-4}" y="{yb-46}" width="70" height="40" rx="10" fill="#2a2d33"/>')
    parts.append(f'<rect x="{x1-60}" y="{yb-40}" width="64" height="34" rx="8" fill="#2a2d33"/>')
    parts.append(f'<path d="M{x0+4},{hood_y+14} L{x0+54},{hood_y+6} L{x0+50},{hood_y+34} L{x0+4},{hood_y+40} Z" fill="#fdfdf8" stroke="#9aa1aa" stroke-width="2"/>')
    parts.append(f'<rect x="{x1-12}" y="{yb-150}" width="14" height="70" rx="4" fill="#c0272f"/>')
    parts.append(f'<path d="M{ws_x+6},{wy2-40} l-26,-8 l0,30 l26,4 Z" fill="#2a2d33"/>')
    parts.append(f'<rect x="{d1-28}" y="{wy2+22}" width="30" height="8" rx="4" fill="{low}"/>')
    parts.append(f'<rect x="{sl+14}" y="{wy2+22}" width="30" height="8" rx="4" fill="{low}"/>')
    # Taxi
    if spec.get("taxi"):
        tx = ws_x + 80
        parts.append(f'<rect x="{tx}" y="{yt-34}" width="120" height="32" rx="8" fill="#16171b"/>')
        parts.append(f'<text x="{tx+60}" y="{yt-11}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#ffffff" letter-spacing="3">TAXI</text>')
        parts.append(f'<circle cx="{tx+136}" cy="{yt-18}" r="8" fill="#1f8a5b"/>')
    # Adhesivo de accesibilidad
    parts.append(f'''<g transform="translate({sl + (x1-sl)/2 - 28} {yb-150})"><rect width="56" height="56" rx="8" fill="#1f5fbf"/>
    <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="translate(9 7) scale(1.6)"><circle cx="11" cy="4" r="2" fill="#fff"/><path d="M11 7v6h5l3 6"/><path d="M8.5 10.5a5.5 5.5 0 1 0 7.4 7.2"/></g></g>''')
    # Puerta trasera abierta (vista lateral: batiente abierta)
    if spec["adapt"] != "ninguna":
        if spec["body"] == "monovol":
            parts.append(f'<path d="M{x1-60},{yt+2} L{x1+40},{yt-110} L{x1+56},{yt-98} L{x1-40},{yt+14} Z" fill="url(#paint)" stroke="{low}" stroke-width="3"/>')
        else:
            parts.append(f'<rect x="{x1+2}" y="{yt+10}" width="16" height="{yb-yt-40}" rx="4" fill="url(#paint)" stroke="{low}" stroke-width="3"/>')
    parts.append(wheel(fw, GROUND - r, r))
    parts.append(wheel(rw, GROUND - r, r))
    return "\n  ".join(parts)


def seat():
    return '''
  <ellipse cx="600" cy="712" rx="330" ry="28" fill="url(#shadow)"/>
  <rect x="470" y="600" width="260" height="30" rx="12" fill="#2a2d33"/>
  <rect x="585" y="560" width="30" height="48" fill="#3b4048"/>
  <rect x="500" y="630" width="200" height="16" rx="8" fill="#50565f"/>
  <rect x="430" y="690" width="340" height="18" rx="9" fill="#2a2d33"/>
  <rect x="520" y="646" width="20" height="50" fill="#3b4048"/><rect x="660" y="646" width="20" height="50" fill="#3b4048"/>
  <path d="M430 540 Q430 500 470 500 L760 500 Q800 500 800 540 L800 560 Q800 580 780 580 L450 580 Q430 580 430 560 Z" fill="url(#leather)"/>
  <path d="M470 505 Q440 505 440 470 L420 250 Q416 210 456 205 L556 196 Q596 194 598 234 L610 500 Z" fill="url(#leather)"/>
  <path d="M470 205 Q470 150 520 146 L548 144 Q590 142 592 190 L592 202 L470 214 Z" fill="url(#leather)"/>
  <path d="M458 262 L590 250 M462 330 L596 320 M466 400 L600 392" stroke="#0f1013" stroke-opacity=".35" stroke-width="3"/>
  <path d="M740 520 L740 430 Q740 410 760 410 L780 410 Q800 410 800 430 L800 520" fill="#2a2d33"/>
  <path d="M860 470 A150 150 0 0 1 860 650" fill="none" stroke="#cb313a" stroke-width="10" stroke-linecap="round"/>
  <path d="M840 640 l22 14 l10 -26" fill="none" stroke="#cb313a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'''


DEFS = '''
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dde2"/><stop offset="1" stop-color="#eef0f3"/></linearGradient>
    <radialGradient id="shadow"><stop offset="0" stop-color="#0f1013" stop-opacity=".45"/><stop offset="1" stop-color="#0f1013" stop-opacity="0"/></radialGradient>
    <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset=".55" stop-color="{mid}"/><stop offset="1" stop-color="{low}"/></linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4553"/><stop offset="1" stop-color="#101419"/></linearGradient>
    <radialGradient id="rim" cx=".4" cy=".35"><stop offset="0" stop-color="#f4f5f7"/><stop offset="1" stop-color="#9aa1aa"/></radialGradient>
    <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3d44"/><stop offset="1" stop-color="#16171b"/></linearGradient>
  </defs>'''


_BACKDROP = None


def backdrop():
    """Foto de la exposición, desenfocada, como fondo (mismo entorno que las fotos reales)."""
    global _BACKDROP
    if _BACKDROP is None:
        _BACKDROP = ""
        if Image and BACKDROP.exists():
            im = Image.open(BACKDROP).convert("RGB")
            w, h = im.size
            im = im.crop((0, int(h * .18), w, h)).resize((640, 480))
            im = im.filter(ImageFilter.GaussianBlur(7))
            im = ImageEnhance.Brightness(im).enhance(1.25)
            im = ImageEnhance.Color(im).enhance(.75)
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=62, optimize=True)
            _BACKDROP = base64.b64encode(buf.getvalue()).decode()
    return _BACKDROP


def svg(content, colors, title):
    top, mid, low = colors
    bg = backdrop()
    back = (f'<image href="data:image/jpeg;base64,{bg}" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"/>'
            f'<rect width="{W}" height="{H}" fill="#ffffff" fill-opacity=".38"/>'
            f'<rect y="{GROUND-40}" width="{W}" height="{H-GROUND+40}" fill="url(#floor)" fill-opacity=".55"/>') if bg else (
            f'<rect width="{W}" height="{GROUND}" fill="url(#wall)"/><rect y="{GROUND}" width="{W}" height="{H-GROUND}" fill="url(#floor)"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">
  <title>{title} — imagen orientativa</title>{DEFS.format(top=top, mid=mid, low=low)}
  {back}
  {content}
  <g transform="translate({W-300} {H-66})"><rect width="270" height="40" rx="20" fill="#16171b" fill-opacity=".78"/>
  <text x="135" y="26" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#fff" letter-spacing="1.5">IMAGEN ORIENTATIVA</text></g>
</svg>
'''


VEHICULOS = {
    865: dict(title="Ford Transit Custom taxi adaptado", body="combi", color="blanco", windows=3, adapt="rampa", taxi=True),
    852: dict(title="Chrysler Voyager taxi adaptado", body="monovol", color="blanco", windows=2, adapt="rampa", taxi=True),
    863: dict(title="Peugeot Boxer adaptado con plataforma", body="furgon", color="blanco", windows=2, adapt="plataforma"),
    862: dict(title="Ford Transit 350 adaptada con plataforma", body="furgon_h", color="plata", windows=3, adapt="plataforma"),
    860: dict(title="Renault Master adaptada con plataforma", body="furgon_m", color="blanco", windows=3, adapt="plataforma"),
    891: dict(title="Fiat Ducato minibús 11 plazas adaptado", body="minibus", color="blanco", windows=5, adapt="plataforma"),
}

def frame(spec):
    """Ajusta el lienzo (4:3) para que el vehículo y su adaptación llenen la imagen."""
    global W, H, GROUND
    b = BODY[spec["body"]]
    extra = 300 if spec["adapt"] == "plataforma" else (270 if spec["adapt"] == "rampa" else 0)
    W = 150 + b["L"] + extra + 90
    H = round(W * 3 / 4)
    GROUND = round(H * .74)


if __name__ == "__main__":
    global_ok = True
    OUT.mkdir(parents=True, exist_ok=True)
    for vid, spec in VEHICULOS.items():
        frame(spec)
        (OUT / f"{vid}.svg").write_text(svg(van(spec), PAINT[spec["color"]], spec["title"]), encoding="utf-8")
        print("✓", vid, spec["title"])
    W, H, GROUND = 1200, 900, 740
    (OUT / "872.svg").write_text(svg(seat(), PAINT["gris"], "Butaca adaptada"), encoding="utf-8")
    print("✓ 872 Butaca adaptada")
