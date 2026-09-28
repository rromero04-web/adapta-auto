# Adapta Auto — nueva web

Rediseño completo de [adapta-auto.com](https://www.adapta-auto.com/) con los contenidos, vehículos y fotos de la web actual. Es una web estática (HTML, CSS y JavaScript sin dependencias) que se puede alojar en cualquier servidor.

## Páginas

| Página | Contenido |
| --- | --- |
| `index.html` | Portada: últimas incorporaciones, categorías, empresa, proceso, guía |
| `vehiculos.html` | Catálogo con filtros por categoría (`?cat=conducir`, `turismos`, `furgonetas`, `taxi`, `alquiler`), búsqueda, orden y opción de ocultar vendidos |
| `vehiculo.html?id=912` | Ficha de cada vehículo: galería, precio, equipamiento, descripción, ficha técnica y vehículos similares |
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
