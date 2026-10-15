// Configuración de la data de muestra de Fit Lab. Todo parámetro del generador vive acá, con su origen.
// «confirmé» = tiene fuente (docs/rediseno/investigacion/06-data-verosimil.md); «asumo» = sin fuente primaria.
// Para adaptar la demo a otro cliente se cambia este archivo, no los componentes.

import { CLIENTE } from '../cliente.js';

export const CONFIG = {
  semilla: 20260930,
  desde: '2025-01-01',
  corte: '2026-09-30', // fecha fija de la muestra: nunca Date.now()
  marca: CLIENTE, // quién es el cliente: src/cliente.js
  moneda: '$', // todo monto en dólares, como facturan las plataformas

  // Índice mensual de «gimnasio» en Perú, Google Trends 2022-2025, media anual = 1 (confirmé, informe 06 §4.4)
  estacionalidad: [1.24, 1.14, 1.01, 0.89, 0.93, 0.87, 0.96, 1.08, 0.98, 0.96, 0.94, 1.0],
  // Leads por día de la semana, lunes a domingo (asumo: la búsqueda es plana; el formulario se llena menos el fin de semana)
  diaSemana: [1.05, 1.04, 1.02, 1.0, 0.95, 0.96, 0.98],
  factorFeriado: 0.78, // asumo: el lead baja en feriado aunque la búsqueda suba (informe 06 §4.4)

  // Feriados nacionales 2025 y 2026 (confirmé, informe 06 §4.6)
  feriados: [
    '2025-01-01', '2025-04-17', '2025-04-18', '2025-05-01', '2025-06-07', '2025-06-29', '2025-07-23', '2025-07-28', '2025-07-29',
    '2025-08-06', '2025-08-30', '2025-10-08', '2025-11-01', '2025-12-08', '2025-12-09', '2025-12-25',
    '2026-01-01', '2026-04-02', '2026-04-03', '2026-05-01', '2026-06-07', '2026-06-29', '2026-07-23', '2026-07-28', '2026-07-29',
    '2026-08-06', '2026-08-30',
  ],

  // Canales pagados. CPL = CPM / (1000 · CTR · CVR): se deriva, nunca se fija (informe 06 §4.3).
  // calidad: cuánto más (o menos) convierte un lead del canal en cita y en inscripción. Asumo: la búsqueda
  // trae intención declarada y convierte más; el formulario instantáneo de redes, menos.
  // metaCpl: asumo. En una demo real la fija el cliente.
  // Montos en dólares: los supuestos se calibraron en soles para Lima y se pasaron a 3,75 soles por dólar (asumo;
  // es muestra fija, no sigue el tipo de cambio del día).
  canales: [
    { id: 'meta', nombre: 'Meta Ads', cpm: 3.2, ctr: 0.015, cvr: 0.08, reparto: 0.45, metaCpl: 3.2, calidad: { cita: 0.85, alta: 0.85 }, webPropia: 0.25, inflacion: 0.14 },
    { id: 'search', nombre: 'Search', cpm: 24, ctr: 0.055, cvr: 0.07, reparto: 0.3, metaCpl: 6.7, calidad: { cita: 1.3, alta: 1.35 }, webPropia: 1, inflacion: 0.04 },
    { id: 'tiktok', nombre: 'TikTok Ads', cpm: 2.67, ctr: 0.009, cvr: 0.05, reparto: 0.15, metaCpl: 5.3, calidad: { cita: 0.9, alta: 0.8 }, webPropia: 0.25, inflacion: 0.18 },
    { id: 'display', nombre: 'Display', cpm: 1.6, ctr: 0.004, cvr: 0.025, reparto: 0.1, metaCpl: 12, calidad: { cita: 1.0, alta: 1.0 }, webPropia: 1, inflacion: 0.09 },
  ],
  // Plataformas como las ve el cliente y como reporta cada una: Google Ads junta sus campañas de Search y de Display.
  // Los canales de arriba son el detalle interno del generador; en pantalla todo se lee por plataforma.
  plataformas: [
    { id: 'google', nombre: 'Google Ads', canales: ['search', 'display'] },
    { id: 'meta', nombre: 'Meta Ads', canales: ['meta'] },
    { id: 'tiktok', nombre: 'TikTok Ads', canales: ['tiktok'] },
  ],
  // webPropia: fracción de los leads del canal que entra por un formulario del sitio (el resto, formulario dentro de la plataforma)
  // inflacion: cuánto de más reporta la plataforma sobre los leads que llegan al CRM (duplicados, pruebas, conversiones
  // por vista). Asumo: los formularios dentro de redes inflan más que la búsqueda.
  // Leads que llegan por el sitio sin pauta: entran al CRM pero no son leads de pauta (asumo: convierten un poco más)
  organico: { id: 'organico', nombre: 'Sitio sin pauta', calidad: { cita: 1.1, alta: 1.1 } },

  presupuestoMensual: 16000, // asumo, en dólares
  pesoPresupuestoMes: [1.3, 1.15, 1.0, 0.9, 0.9, 0.85, 0.95, 1.05, 1.0, 0.95, 0.95, 1.0], // asumo: la inversión sigue a la demanda
  presionSubasta: [1.15, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05, 1.0, 1.0, 1.0, 1.12, 1.18], // asumo: CPM más caro en enero y fin de año

  // Embudo de cohorte: cada etapa es fracción binomial de la anterior (asumo, anclado a rangos de proveedores, informe 06 §4.2)
  embudo: { contacto: 0.78, cita: 0.42, asiste: 0.7, alta: 0.35, rezagoAltaMax: 14 },

  // Sitio web: sesiones por fuente. Las de pauta salen de los clics; las demás, de una base diaria con estacionalidad (asumo)
  web: {
    fuentes: [
      { id: 'organica', nombre: 'Búsqueda orgánica', base: 520, conversion: 0.012, movil: 0.72 },
      { id: 'directo', nombre: 'Directo', base: 210, conversion: 0.016, movil: 0.6 },
      { id: 'redes', nombre: 'Redes sociales orgánicas', base: 160, conversion: 0.006, movil: 0.92 },
      { id: 'referidos', nombre: 'Referencia', base: 60, conversion: 0.01, movil: 0.55 },
      { id: 'ads', nombre: 'Búsqueda pagada', deClics: ['search'], llegada: 0.88, movil: 0.7 },
      { id: 'display', nombre: 'Display', deClics: ['display'], llegada: 0.8, movil: 0.75 },
      { id: 'redesPagadas', nombre: 'Redes sociales pagadas', deClics: ['meta', 'tiktok'], llegada: 0.7, movil: 0.95 },
    ],
    paginas: [
      { id: 'inicio', ruta: '/', nombre: 'Inicio', peso: 0.3, conversion: 0.3 },
      { id: 'membresias', ruta: '/membresias', nombre: 'Membresías', peso: 0.17, conversion: 1.6 },
      { id: 'prueba', ruta: '/prueba-gratis', nombre: 'Prueba gratis', peso: 0.14, conversion: 3.4 },
      { id: 'sedes', ruta: '/sedes', nombre: 'Sedes', peso: 0.13, conversion: 0.8 },
      { id: 'clases', ruta: '/clases', nombre: 'Clases', peso: 0.1, conversion: 0.6 },
      { id: 'horarios', ruta: '/horarios', nombre: 'Horarios', peso: 0.08, conversion: 0.4 },
      { id: 'blog', ruta: '/blog', nombre: 'Blog', peso: 0.05, conversion: 0.15 },
      { id: 'contacto', ruta: '/contacto', nombre: 'Contacto', peso: 0.03, conversion: 1.0 },
      { id: 'promo', ruta: '/promo-setiembre', nombre: 'Promo de setiembre', peso: 0, conversion: 0, desde: '2026-09-08', pesoDesde: 0.16 },
    ],
  },

  // 12 sedes; col y fila ubican la tesela del distrito (no es un mapa a escala)
  sedes: [
    { id: 'lo', distrito: 'Los Olivos', corto: 'Los Olivos', zona: 'Lima Norte', col: 1, fila: 0, peso: 0.9, abre: '2026-03-02' },
    { id: 'in', distrito: 'Independencia', corto: 'Independ.', zona: 'Lima Norte', col: 2, fila: 0, peso: 0.7 },
    { id: 'sm', distrito: 'San Miguel', corto: 'San Miguel', zona: 'Lima Moderna', col: 0, fila: 1, peso: 1.0 },
    { id: 'jm', distrito: 'Jesús María', corto: 'Jesús María', zona: 'Lima Moderna', col: 1, fila: 1, peso: 0.9 },
    { id: 'li', distrito: 'Lince', corto: 'Lince', zona: 'Lima Moderna', col: 2, fila: 1, peso: 0.8 },
    { id: 'mg', distrito: 'Magdalena del Mar', corto: 'Magdalena', zona: 'Lima Moderna', col: 0, fila: 2, peso: 0.85 },
    { id: 'si', distrito: 'San Isidro', corto: 'San Isidro', zona: 'Lima Moderna', col: 1, fila: 2, peso: 1.2 },
    { id: 'sb', distrito: 'San Borja', corto: 'San Borja', zona: 'Lima Moderna', col: 2, fila: 2, peso: 1.0 },
    { id: 'at', distrito: 'Ate', corto: 'Ate', zona: 'Lima Este', col: 3, fila: 2, peso: 0.75 },
    { id: 'mi', distrito: 'Miraflores', corto: 'Miraflores', zona: 'Lima Moderna', col: 1, fila: 3, peso: 1.4 },
    { id: 'su', distrito: 'Santiago de Surco', corto: 'Surco', zona: 'Lima Moderna', col: 2, fila: 3, peso: 1.3 },
    { id: 'lm', distrito: 'La Molina', corto: 'La Molina', zona: 'Lima Este', col: 3, fila: 3, peso: 1.0 },
  ],

  // Hora del día en que entra el lead (asumo; no hay fuente)
  perfilHora: {
    laborable: [1, 0.5, 0.3, 0.2, 0.3, 1.2, 3.2, 4.0, 3.4, 2.6, 2.4, 2.6, 3.4, 3.0, 2.4, 2.4, 2.8, 3.6, 4.6, 5.6, 5.8, 4.8, 3.2, 1.8],
    finDeSemana: [1.4, 0.8, 0.5, 0.3, 0.2, 0.3, 0.8, 1.8, 3.2, 4.4, 4.8, 4.6, 4.0, 3.4, 3.0, 2.8, 3.0, 3.2, 3.4, 3.6, 3.6, 3.2, 2.6, 1.8],
  },

  // Competencia: marcas reales, SOLO conversación social de muestra (menciones que suman 100 % con «Otros»).
  // Sin sentimiento, sin market share, sin atributos (informe 06 §3.2).
  conversacion: [
    { id: 'smartfit', nombre: 'Smart Fit', base: 820, picos: { 7: 1.26, 12: 1.53 } },
    { id: 'b2', nombre: 'b2', base: 270, crece: -0.2 },
    { id: 'bioritmo', nombre: 'Bio Ritmo', base: 150 },
    { id: 'ko', nombre: 'KO', base: 115, crece: 0.15 },
    { id: 'megaforce', nombre: 'Mega Force', base: 110 },
    { id: 'fitlab', nombre: 'Fit Lab', base: 120, propia: true, crece: 0.95 },
    { id: 'otros', nombre: 'Otros', base: 420 },
  ],

  // Búsquedas: índice semanal tipo Trends, normalizado al máximo del conjunto = 100
  busquedas: [
    { id: 'gimnasio', termino: 'gimnasio', base: 100 },
    { id: 'cerca', termino: 'gimnasio cerca de mí', base: 62, crece: 0.25 },
    { id: 'precio', termino: 'precio gimnasio', base: 38 },
    { id: 'personal', termino: 'entrenador personal', base: 22, crece: 0.35 },
    { id: 'spinning', termino: 'clases de spinning', base: 18, crece: -0.15 },
    { id: 'pilates', termino: 'pilates reformer', base: 2, aparece: '2026-05-04', despues: 16 }, // casi no se buscaba antes de mayo de 2026
    { id: 'marca', termino: 'fit lab', base: 9, crece: 0.9, propia: true },
  ],

  // ══════════ Detalle de producción (src/muestra/detalle.js). Todo «asumo» salvo que diga otra cosa ══════════
  // Campañas por canal: el gasto del día se reparte por peso entre las activas; clics y leads, por multinomial
  // con su CTR y conversión relativos. Suman exacto el total del canal. conversion 0 = campaña sin leads (alcance).
  campanas: {
    search: [
      { id: 's-marca', nombre: 'FL | Search | Marca', producto: 'marca', peso: 0.16, ctr: 2.4, conversion: 1.7 },
      { id: 's-membresias', nombre: 'FL | Search | Membresías Lima', producto: 'membresias', peso: 0.52, ctr: 1, conversion: 1 },
      { id: 's-distritos', nombre: 'FL | Search | Gimnasio por distrito', producto: 'membresias', peso: 0.32, ctr: 0.9, conversion: 0.95 },
    ],
    display: [
      { id: 'd-remarketing', nombre: 'FL | Display | Remarketing', producto: 'membresias', peso: 0.4, ctr: 1.7, conversion: 1.5 },
      { id: 'd-prospeccion', nombre: 'FL | Display | Prospección', producto: 'marca', peso: 0.6, ctr: 0.55, conversion: 0.65 },
    ],
    meta: [
      { id: 'm-prueba', nombre: 'FL | Leads | Clase de prueba', producto: 'membresias', peso: 0.5, ctr: 1, conversion: 1.1 },
      { id: 'm-remarketing', nombre: 'FL | Leads | Remarketing', producto: 'membresias', peso: 0.2, ctr: 1.5, conversion: 1.35 },
      { id: 'm-reto', nombre: 'FL | Leads | Reto de enero', producto: 'membresias', peso: 0.7, ctr: 1.2, conversion: 1.2, activa: [['2025-01-02', '2025-02-15'], ['2026-01-02', '2026-02-15']] },
      { id: 'm-olivos', nombre: 'FL | Leads | Apertura Los Olivos', producto: 'membresias', peso: 0.3, ctr: 1.1, conversion: 1.25, activa: [['2026-02-16', '2026-04-30']] },
      { id: 'm-alcance', nombre: 'FL | Alcance | Marca', producto: 'marca', peso: 0.18, ctr: 0.45, conversion: 0 },
    ],
    tiktok: [
      { id: 't-prueba', nombre: 'FL | TikTok | Clase de prueba', producto: 'membresias', peso: 0.7, ctr: 1, conversion: 1 },
      { id: 't-alcance', nombre: 'FL | TikTok | Alcance', producto: 'marca', peso: 0.3, ctr: 1.15, conversion: 0 },
    ],
  },
  productos: { membresias: 'Membresías', marca: 'Marca' },

  // Palabras clave de Search: reparten los clics y las conversiones del canal; el gasto, por clics × CPC relativo.
  palabrasClave: [
    { texto: 'fit lab', concordancia: 'exacta', clics: 0.11, conversion: 2.3, cpc: 0.4 },
    { texto: 'gimnasio cerca de mí', concordancia: 'frase', clics: 0.15, conversion: 1, cpc: 1 },
    { texto: 'gimnasio miraflores', concordancia: 'frase', clics: 0.08, conversion: 1.2, cpc: 1.15 },
    { texto: 'gimnasio surco', concordancia: 'frase', clics: 0.07, conversion: 1.1, cpc: 1 },
    { texto: 'gimnasio san isidro', concordancia: 'frase', clics: 0.06, conversion: 1.1, cpc: 1.25 },
    { texto: 'gimnasio los olivos', concordancia: 'frase', clics: 0.06, conversion: 1.05, cpc: 0.8, desde: '2026-02-16' },
    { texto: 'precio gimnasio lima', concordancia: 'amplia', clics: 0.09, conversion: 0.8, cpc: 0.9 },
    { texto: 'membresía gimnasio', concordancia: 'frase', clics: 0.07, conversion: 1.3, cpc: 1.2 },
    { texto: 'clase de prueba gimnasio', concordancia: 'frase', clics: 0.05, conversion: 1.7, cpc: 0.9 },
    { texto: 'gimnasio 24 horas', concordancia: 'amplia', clics: 0.06, conversion: 0.12, cpc: 1.05 },
    { texto: 'crossfit lima', concordancia: 'amplia', clics: 0.04, conversion: 0.05, cpc: 1.35 },
    { texto: 'otras palabras', concordancia: '', clics: 0.16, conversion: 0.8, cpc: 1, resto: true },
  ],
  // Términos que de verdad se buscaron (otra lectura de los mismos clics de Search)
  terminosBusqueda: [
    { texto: 'fit lab', clics: 0.08, conversion: 2.3 },
    { texto: 'fit lab horarios', clics: 0.03, conversion: 1.8 },
    { texto: 'gimnasio cerca de mi', clics: 0.12, conversion: 1 },
    { texto: 'gimnasios en miraflores', clics: 0.06, conversion: 1.15 },
    { texto: 'gimnasio barato lima', clics: 0.07, conversion: 0.7 },
    { texto: 'smart fit precios', clics: 0.05, conversion: 0.35 },
    { texto: 'gimnasio con piscina', clics: 0.04, conversion: 0.2 },
    { texto: 'gimnasio abierto 24 horas', clics: 0.05, conversion: 0.12 },
    { texto: 'clases de baile para adultos', clics: 0.03, conversion: 0.4 },
    { texto: 'otros términos', clics: 0.47, conversion: 1, resto: true },
  ],

  // Programática: llega en una planilla manual sin fecha por día; no sigue el período y no se suma a la inversión de plataformas
  programatica: {
    campana: 'FL | Programática | Prospección Lima Norte', desde: '2026-08-18', hasta: '2026-09-30',
    fuente: 'Planilla del equipo de programática (carga manual)', sitios: 214,
    formatos: [
      { nombre: 'Notificación push', compra: 'CPC', audiencia: '18 a 34 años · Lima Norte', impresiones: 420000, ctr: 0.009, costoUnidad: 0.085 },
      { nombre: 'Banners display', compra: 'CPM', audiencia: 'Alrededor de las sedes de Lima Norte', impresiones: 1600000, ctr: 0.0021, costoUnidad: 0.83 },
      { nombre: 'Video en apps', compra: 'CPM', audiencia: '18 a 44 años · Lima', impresiones: 380000, ctr: 0.0042, costoUnidad: 2 },
    ],
  },

  // CRM por dentro. Un lead que no pasó de etapa sigue «en la etapa» hasta cumplir su plazo; después se descarta.
  crm: {
    etapas: ['Nuevo lead', 'Contactado', 'Cita agendada', 'Asistió a clase de prueba', 'Inscrito'],
    plazoAbierto: [5, 14, 10, 21], // días que un lead puede seguir en cada etapa antes de descartarse
    // tiempo al primer contacto, por tramo; el fin de semana el equipo atiende con menos personas y tarda más (asumo)
    tramosContacto: ['menos de 1 h', '1 a 4 h', '4 a 24 h', '1 a 2 días', 'más de 2 días'],
    contactoLaborable: [0.42, 0.26, 0.2, 0.08, 0.04],
    contactoFinDeSemana: [0.18, 0.2, 0.32, 0.18, 0.12],
    contactoLento: { desde: '2026-09-01', texto: 'Dos asesoras menos en el equipo', factor: [0.75, 0.95, 1.1, 1.6, 2] }, // historia de setiembre
    sinRegistroContacto: 0.07,
    intentos: [0.27, 0.24, 0.19, 0.12, 0.08, 0.1], // 1, 2, 3, 4, 5, 6 o más intentos de contacto
    motivosDescarte: [
      { motivo: 'Busca sede en otro distrito', peso: 0.23 },
      { motivo: 'El precio no le acomoda', peso: 0.22 },
      { motivo: 'Solo pedía horarios', peso: 0.17 },
      { motivo: 'Dejó de responder', peso: 0.2 },
      { motivo: 'Ya es socio', peso: 0.06 },
      { motivo: 'Menor de edad', peso: 0.04 },
      { motivo: 'Otros motivos', peso: 0.08 },
    ],
    ticketInscripcion: 50, // asumo: matrícula más primer mes, en dólares; valor de una inscripción en el CRM
    campanas: [
      { id: 'reto-2025', nombre: 'Reto de enero 2025', desde: '2025-01-02', hasta: '2025-02-15', canales: ['meta', 'tiktok'], participacion: 0.8 },
      { id: 'reto-2026', nombre: 'Reto de enero 2026', desde: '2026-01-02', hasta: '2026-02-15', canales: ['meta', 'tiktok'], participacion: 0.8 },
      { id: 'olivos', nombre: 'Apertura Los Olivos', desde: '2026-02-16', hasta: '2026-04-30', sedes: ['lo'], participacion: 1 },
      { id: 'anual', nombre: 'Plan anual con precio congelado', desde: '2026-08-15', hasta: '2026-10-31', canales: ['meta', 'search'], participacion: 0.3 },
    ],
    // participacion: de los leads que cumplen canal, sede y fechas, qué parte queda etiquetada con la campaña en el CRM
  },

  // Redes. TikTok: hashtags del rubro, lectura mensual (asumo órdenes de magnitud)
  hashtags: [
    { tag: '#gymperu', publicaciones: 520, vistasPorPublicacion: 4200, interaccion: 0.058 },
    { tag: '#gymtok', publicaciones: 1900, vistasPorPublicacion: 9800, interaccion: 0.071 },
    { tag: '#fitnessperu', publicaciones: 310, vistasPorPublicacion: 3100, interaccion: 0.064 },
    { tag: '#rutinadegym', publicaciones: 680, vistasPorPublicacion: 7600, interaccion: 0.082 },
    { tag: '#pilatesreformer', publicaciones: 140, vistasPorPublicacion: 5200, interaccion: 0.09, crece: 2.2 },
    { tag: '#crossfitperu', publicaciones: 95, vistasPorPublicacion: 2600, interaccion: 0.05, crece: -0.2 },
    { tag: '#limafit', publicaciones: 120, vistasPorPublicacion: 2900, interaccion: 0.061 },
    { tag: '#fitlab', publicaciones: 18, vistasPorPublicacion: 2100, interaccion: 0.074, crece: 1.4, propia: true },
  ],
  // Competencia en redes: publicaciones del mes, interacción por publicación y anuncios activos (biblioteca de anuncios de Meta)
  // Competencia en Facebook: lectura del mes (sin comparación: en producción la biblioteca de anuncios y las
  // publicaciones se leen al día, no hay historia de la competencia). sentimiento: reparto de los comentarios en sus
  // publicaciones entre positivos y negativos (el resto, neutros). Asumo repartos moderados: ningún competidor real
  // queda con sentimiento negativo con cifras inventadas. palabras: genéricas del rubro, de muestra.
  redesMarcas: [
    { id: 'smartfit', publicaciones: 34, interaccion: 1450, anuncios: 46, sentimiento: { positivo: 0.48, negativo: 0.16 }, palabras: ['plan', 'precio', 'sedes', 'app'] },
    { id: 'b2', publicaciones: 22, interaccion: 380, anuncios: 9, sentimiento: { positivo: 0.5, negativo: 0.12 }, palabras: ['funcional', 'clases', 'comunidad'] },
    { id: 'bioritmo', publicaciones: 26, interaccion: 520, anuncios: 14, sentimiento: { positivo: 0.54, negativo: 0.1 }, palabras: ['bienestar', 'piscina', 'clases'] },
    { id: 'ko', publicaciones: 18, interaccion: 610, anuncios: 6, crece: 0.25, sentimiento: { positivo: 0.55, negativo: 0.11 }, palabras: ['boxeo', 'reto', 'entrenamiento'] },
    { id: 'megaforce', publicaciones: 15, interaccion: 290, anuncios: 4, sentimiento: { positivo: 0.46, negativo: 0.15 }, palabras: ['máquinas', 'horario', 'promoción'] },
    { id: 'fitlab', publicaciones: 20, interaccion: 340, anuncios: 12, crece: 0.6, propia: true, sentimiento: { positivo: 0.6, negativo: 0.1 }, palabras: ['primera semana', 'clase de prueba', 'coach'] },
  ],
  formatosAnuncio: [{ nombre: 'Imagen', peso: 0.45 }, { nombre: 'Video', peso: 0.38 }, { nombre: 'Carrusel', peso: 0.17 }],

  // Búsquedas por región: Google informa las regiones donde más se busca cada palabra (índice relativo, la primera = 100)
  regiones: ['Lima', 'Callao', 'La Libertad', 'Lambayeque', 'Piura', 'Ica', 'Junín', 'Áncash'],
  pesoRegion: {
    gimnasio: [1, 0.92, 0.8, 0.7, 0.66, 0.6, 0.55, 0.5],
    cerca: [1, 1.05, 0.62, 0.55, 0.5, 0.48, 0.4, 0.38],
    precio: [0.9, 1, 0.85, 0.82, 0.75, 0.7, 0.66, 0.6],
    personal: [1, 0.7, 0.58, 0.5, 0.45, 0.48, 0.35, 0.3],
    spinning: [1, 0.66, 0.7, 0.62, 0.5, 0.55, 0.45, 0.4],
    pilates: [1, 0.6, 0.45, 0.4, 0.36, 0.38, 0.3, 0.25],
    marca: [1, 0.35, 0, 0, 0, 0, 0, 0],
  },

  // Sitio: tasa de sesiones con interacción por fuente y hora de las sesiones (Analytics no cruza día por hora)
  // GA4: de cada sesión, cuántas cuentan como sesión con interacción (más de 10 s, una conversión o dos páginas). Asumo.
  interaccionWeb: { organica: 0.62, directo: 0.58, redes: 0.37, referidos: 0.55, ads: 0.49, display: 0.22, redesPagadas: 0.42 },
  // Sesiones por usuario al día y segundos de interacción por sesión con interacción, por canal (asumo)
  usuariosWeb: { organica: 1.15, directo: 1.3, redes: 1.1, referidos: 1.1, ads: 1.12, display: 1.05, redesPagadas: 1.06 },
  segundosWeb: { organica: 74, directo: 92, redes: 41, referidos: 66, ads: 58, display: 22, redesPagadas: 33 },
  // Historia de la muestra: desde las piezas nuevas de Meta (8 set) los clics suben, pero llegan a /promo-setiembre,
  // que carga lento en celular, y la interacción de las sesiones de redes pagadas cae
  // Escenario de la demo, para que el modelo proponga mover inversión con sus reglas de siempre: desde setiembre
  // la subasta de TikTok se encarece (pasa su objetivo de costo por lead) y sus leads se inscriben menos que los de
  // las otras plataformas (calidad.alta), así el CRM confirma que es la que más cuesta por inscripción.
  cambiosCosto: [{ canal: 'tiktok', desde: '2026-09-01', factor: 1.7 }],
  cambiosInteraccion: [{ fuente: 'redesPagadas', desde: '2026-09-08', factor: 0.62, texto: 'las piezas nuevas de Meta llevan a /promo-setiembre' }],
  // Vistas de página por sesión, por página (asumo)
  vistasPorSesion: 2.1,
  perfilHoraWeb: [0.8, 0.4, 0.25, 0.2, 0.3, 0.9, 2.4, 3.6, 3.9, 3.6, 3.4, 3.5, 3.9, 3.6, 3.2, 3.1, 3.3, 3.8, 4.6, 5.2, 5.4, 4.6, 3.1, 1.7],

  // Eventos que la data cuenta y la pantalla anota
  eventos: [
    { fecha: '2025-01-06', tipo: 'campana', texto: 'Reto de enero 2025' },
    { fecha: '2026-01-05', tipo: 'campana', texto: 'Reto de enero 2026' },
    { fecha: '2026-03-02', tipo: 'sede', texto: 'Abre Los Olivos' },
    { fecha: '2026-07-14', tipo: 'caida', canal: 'meta', texto: 'Meta no entregó datos' },
    { fecha: '2026-09-08', tipo: 'creativo', canal: 'meta', texto: 'Nuevas piezas en Meta' },
  ],

  // Umbrales de método, declarados para que ningún número quede suelto en la pantalla
  metodo: {
    margenParecido: 0.1, // asumo: costos por inscripción a menos de 10 % entre sí se leen como parecidos (la cohorte tiene ruido)
    coberturaMinima: 0.6, // un delta se publica con al menos 60 % de días medidos en las dos ventanas
    casosMinimos: 30, // una tasa con menos casos en el denominador se marca «pocos casos»
    bandasIndice: [{ hasta: 40, nombre: 'baja' }, { hasta: 70, nombre: 'media' }, { hasta: 100, nombre: 'alta' }], // asumo
    bandasCpl: [{ fraccion: 0.85, nombre: 'holgado' }, { fraccion: 1, nombre: 'en meta' }], // asumo
    elasticidad: { central: 0.8, baja: 0.7, alta: 0.9 }, // asumo: leads ∝ inversión^β al mover presupuesto
    mejoraAgendamiento: 0.05, // asumo: escenario de +5 puntos en la tasa de cita
    mesesProyeccion: 3,
    // el escenario de un mes se muestra solo si su rango acertó 7 de cada 10 veces en 10 pruebas o más
    aciertoMinimo: 0.7,
    pruebasMinimas: 10,
  },
};
