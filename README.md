# Adapta Auto — nueva web

Rediseño completo de [adapta-auto.com](https://www.adapta-auto.com/) con los contenidos, vehículos y fotos de la web actual. Es una web estática (HTML, CSS y JavaScript sin dependencias) que se puede alojar en cualquier servidor.

## Diseño: «Plano de reforma»

Cada página es una lámina del proyecto de adaptación que sale del taller: papel de plotter sobre una mesa de dibujo, tinta grafito y el rojo del logotipo como capa de revisión (globos de referencia, cotas y la acción principal). Los vehículos reales se presentan anotados y acotados, y cada lámina lleva su número de hoja y su cajetín.

- En la portada, el vehículo entra en la lámina y sale del marco de la foto; después se dibujan la cota y los globos que señalan cada elemento de la adaptación. Las vistas se pueden pausar, se manejan con teclado o deslizando el dedo y respetan la preferencia de movimiento reducido.
- Tipografías alojadas en la propia web (`assets/fonts/`, licencia OFL): Archivo, ancha, para títulos y rótulos, y Atkinson Hyperlegible Next para la lectura.
- El sistema de diseño (colores, tipos, componentes) está descrito en `DESIGN.md`, y el contexto del negocio en `PRODUCT.md`.

## Páginas

| Página | Contenido |
| --- | --- |
| `index.html` | Portada: vistas animadas del taller y cajetín con las garantías, cuadro de vehículos disponibles, necesidades, proceso, empresa, guía y contacto |
| `vehiculos.html` | Catálogo con capas por categoría (`?cat=conducir`, `turismos`, `furgonetas`, `taxi`, `alquiler`), búsqueda (`?q=`), orden y opción de ocultar vendidos |
| `vehiculo.html?id=912` | Ficha de cada vehículo: vista acotada (largo y alto, cuando constan en el catálogo), ficha técnica, precio, descripción, equipamiento y vehículos similares |
| `adaptaciones.html` | Ayudas de acceso, conducción, elevación y transporte |
| `servicios.html` | Servicios, garantía y preguntas frecuentes |
| `empresa.html` | Quiénes somos, por qué nosotros, valores y proyecto e-2Drive |
| `guia-vehiculo-adaptado.html` | Guía gratuita |
| `contacto.html` | Datos de contacto, horario, formulario y mapa |
| `privacidad.html` | Aviso legal y política de privacidad |

## Editar el catálogo

Los vehículos están en `assets/vehiculos.js`. Para añadir uno, copie un bloque y cambie sus datos. Las fotos van en `assets/fotos/` y se enlazan en la lista `fotos` (la primera es la principal):

```js
fotos: ["assets/fotos/912A.jpg", "assets/fotos/912B.jpg"]
```

Si un vehículo no tiene fotos se muestra una ilustración.

### Imágenes orientativas

Los vehículos sin foto real usan un render generado con `python3 tools/render_vehiculos.py` (vista lateral del modelo con su adaptación, sobre el fondo de la exposición). Llevan la marca «Imagen orientativa» y el campo `fotoOrientativa: true`, que muestra un aviso en la ficha. En cuanto haya fotos reales, sustitúyalas en `fotos` y elimine ese campo.

## Editar páginas

Las páginas se generan a partir de `src/`: la cabecera, el pie y los iconos son comunes (`src/partials/`) y el contenido de cada página está en `src/pages/`. Después de editar, regenere las páginas:

```sh
python3 tools/build.py
```

## Ver en local

```sh
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Impeccable (herramienta de diseño para Claude Code)

La carpeta `.claude/` incluye la habilidad [Impeccable](https://impeccable.style) con la que se ha hecho el rediseño:

- `.claude/skills/impeccable/`: la habilidad y sus guías. La primera vez que se ejecuta descarga su motor.
- `.claude/agents/`: los agentes de revisión final y de documentación del diseño.
- `.claude/settings.json`: comprueba automáticamente las páginas cada vez que se editan (tipografía, contraste, maquetación y otros fallos habituales).
- `.impeccable/`: el encargo de la portada (`surfaces/`) y la ficha del sistema de diseño (`design.json`).
