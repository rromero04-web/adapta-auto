/* ==========================================================================
   Catálogo de vehículos de Adapta Auto
   --------------------------------------------------------------------------
   Para añadir un vehículo, copie un bloque y rellene los campos.
   - categoria: "conducir" | "turismos" | "furgonetas" | "taxi" | "adaptaciones" | "otros"
   - precio:    número en euros (p. ej. 18900) o null para mostrar "Consultar"
   - fotos:     rutas a imágenes (p. ej. "assets/fotos/878-1.jpg"). Si está vacío
                se muestra una ilustración según el tipo de vehículo.
   - fichaOriginal: enlace a la ficha en la web actual (opcional)
   ========================================================================== */

window.ADAPTA_VEHICULOS = [
  {
    id: 878,
    marca: "Vexel",
    modelo: "Quovis L4",
    categoria: "conducir",
    tipo: "micro",
    anio: 2004,
    km: 13500,
    precio: null,
    plazas: 2,
    destacado: true,
    resumen: "Se conduce sentado en su propia silla de ruedas. Solo necesita licencia de ciclomotor.",
    caracteristicas: [
      "Puerta eléctrica",
      "Rampa eléctrica",
      "Se conduce desde la propia silla de ruedas",
      "2 plazas: conductor en su silla y un acompañante",
      "Basta con la licencia de ciclomotor"
    ],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/ficha.asp?id=878"
  },
  {
    id: "berlingo-2016",
    marca: "Citroën",
    modelo: "Berlingo",
    categoria: "turismos",
    tipo: "furgoneta",
    anio: 2016,
    km: 61000,
    precio: null,
    plazas: null,
    resumen: "Adaptado para viajar en silla de ruedas.",
    caracteristicas: [
      "Acceso para silla de ruedas",
      "Revisado por nuestros técnicos",
      "12 meses de garantía mecánica"
    ],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/listado.asp?familia=turismos"
  },
  {
    id: 902,
    marca: "Citroën",
    modelo: "Adaptado",
    categoria: "turismos",
    tipo: "monovolumen",
    anio: null,
    km: null,
    precio: null,
    plazas: null,
    resumen: "Vehículo adaptado. Consúltenos modelo, año y equipamiento.",
    caracteristicas: ["Revisado por nuestros técnicos", "12 meses de garantía mecánica"],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/ficha.asp?id=902"
  },
  {
    id: 904,
    marca: "Renault",
    modelo: "Adaptado",
    categoria: "furgonetas",
    tipo: "furgoneta",
    anio: null,
    km: null,
    precio: null,
    plazas: null,
    resumen: "Vehículo adaptado. Consúltenos modelo, año y equipamiento.",
    caracteristicas: ["Revisado por nuestros técnicos", "12 meses de garantía mecánica"],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/ficha.asp?id=904"
  },
  {
    id: 855,
    marca: "Fiat",
    modelo: "Adaptado",
    categoria: "furgonetas",
    tipo: "furgoneta",
    anio: null,
    km: null,
    precio: null,
    plazas: null,
    resumen: "Vehículo adaptado. Consúltenos modelo, año y equipamiento.",
    caracteristicas: ["Revisado por nuestros técnicos", "12 meses de garantía mecánica"],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/ficha.asp?id=855"
  },
  {
    id: 868,
    marca: "Asientos adaptados",
    modelo: "",
    categoria: "adaptaciones",
    tipo: "asiento",
    anio: null,
    km: null,
    precio: null,
    plazas: null,
    resumen: "Asientos adaptados para facilitar la transferencia al vehículo.",
    caracteristicas: ["Instalación en nuestro taller", "Adaptación homologada"],
    fotos: [],
    fichaOriginal: "https://www.adapta-auto.com/ficha.asp?id=868"
  }
];

window.ADAPTA_CATEGORIAS = {
  todos: "Todos",
  conducir: "Quiero conducir",
  turismos: "Turismos y monovolúmenes",
  furgonetas: "Furgonetas y minibuses",
  taxi: "Taxi adaptado",
  adaptaciones: "Adaptaciones",
  otros: "Otros"
};
