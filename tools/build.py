#!/usr/bin/env python3
"""Genera las páginas HTML de la web a partir de src/.

Cada archivo de src/pages/ empieza con una cabecera de metadatos:

    <!--
    title: Título de la página
    description: Descripción para buscadores
    nav: vehiculos
    scripts: vehiculos
    -->

El resultado se escribe en la raíz del proyecto con el mismo nombre.
Uso:  python3 tools/build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
part = lambda name: (SRC / "partials" / name).read_text(encoding="utf-8")


def build():
    head, sprite, header, footer = part("head.html"), part("sprite.html"), part("header.html"), part("footer.html")
    for page in sorted((SRC / "pages").glob("*.html")):
        text = page.read_text(encoding="utf-8")
        meta_block = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
        meta = dict(re.findall(r"^\s*(\w+):\s*(.+?)\s*$", meta_block.group(1), re.M)) if meta_block else {}
        body = text[meta_block.end():] if meta_block else text

        nav = meta.get("nav", "")
        page_header = header.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"') if nav else header
        scripts = ["assets/vehiculos.js"] if "vehiculos" in meta.get("scripts", "") else []
        scripts.append("assets/main.js")
        tags = "\n".join(f'<script src="{s}"></script>' for s in scripts)

        extra_head = ""
        ld = SRC / "partials" / f"ld-{page.stem}.html"
        if ld.exists():
            extra_head = ld.read_text(encoding="utf-8")

        html = (head.replace("{{title}}", meta.get("title", "Adapta Auto"))
                    .replace("{{description}}", meta.get("description", ""))
                    .replace("{{page}}", page.stem)
                    .replace("{{extra_head}}", extra_head)
                + "\n" + sprite + "\n" + page_header + "\n" + body.strip() + "\n\n" + footer + "\n" + tags + "\n</body>\n</html>\n")
        (ROOT / page.name).write_text(html, encoding="utf-8")
        print("✓", page.name)


if __name__ == "__main__":
    build()
