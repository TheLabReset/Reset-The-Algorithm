// Configuración de la data de muestra de Reset Fit. Todo parámetro del generador vive acá, con su origen.
// «confirmé» = tiene fuente (docs/rediseno/investigacion/06-data-verosimil.md); «asumo» = sin fuente primaria.
// Para adaptar la demo a otro cliente se cambia este archivo, no los componentes.

export const CONFIG = {
  semilla: 20260930,
  desde: '2025-01-01',
  corte: '2026-09-30', // fecha fija de la muestra: nunca Date.now()
  marca: { id: 'resetfit', nombre: 'Reset Fit', rubro: 'cadena de gimnasios', ciudad: 'Lima' },
  moneda: 'S/',

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
  canales: [
    { id: 'meta', nombre: 'Meta', cpm: 12, ctr: 0.015, cvr: 0.08, reparto: 0.45, metaCpl: 12, calidad: { cita: 0.85, alta: 0.85 }, webPropia: 0.25 },
    { id: 'search', nombre: 'Google Search', cpm: 90, ctr: 0.055, cvr: 0.07, reparto: 0.3, metaCpl: 25, calidad: { cita: 1.3, alta: 1.35 }, webPropia: 1 },
    { id: 'tiktok', nombre: 'TikTok', cpm: 10, ctr: 0.009, cvr: 0.05, reparto: 0.15, metaCpl: 20, calidad: { cita: 0.9, alta: 0.95 }, webPropia: 0.25 },
    { id: 'display', nombre: 'Google Display', cpm: 6, ctr: 0.004, cvr: 0.025, reparto: 0.1, metaCpl: 45, calidad: { cita: 1.0, alta: 1.0 }, webPropia: 1 },
  ],
  // webPropia: fracción de los leads del canal que entra por un formulario del sitio (el resto, formulario dentro de la plataforma)
  // Leads que llegan por el sitio sin pauta: entran al CRM pero no son leads de pauta (asumo: convierten un poco más)
  organico: { id: 'organico', nombre: 'Sitio sin pauta', calidad: { cita: 1.1, alta: 1.1 } },

  presupuestoMensual: 60000, // asumo
  pesoPresupuestoMes: [1.3, 1.15, 1.0, 0.9, 0.9, 0.85, 0.95, 1.05, 1.0, 0.95, 0.95, 1.0], // asumo: la inversión sigue a la demanda
  presionSubasta: [1.15, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05, 1.0, 1.0, 1.0, 1.12, 1.18], // asumo: CPM más caro en enero y fin de año

  // Embudo de cohorte: cada etapa es fracción binomial de la anterior (asumo, anclado a rangos de proveedores, informe 06 §4.2)
  embudo: { contacto: 0.78, cita: 0.42, asiste: 0.7, alta: 0.35, rezagoAltaMax: 14 },

  // Sitio web: sesiones por fuente. Las de pauta salen de los clics; las demás, de una base diaria con estacionalidad (asumo)
  web: {
    fuentes: [
      { id: 'organica', nombre: 'Búsqueda orgánica', base: 520, conversion: 0.012, movil: 0.72 },
      { id: 'directo', nombre: 'Directo', base: 210, conversion: 0.016, movil: 0.6 },
      { id: 'redes', nombre: 'Redes sin pauta', base: 160, conversion: 0.006, movil: 0.92 },
      { id: 'referidos', nombre: 'Referidos', base: 60, conversion: 0.01, movil: 0.55 },
      { id: 'ads', nombre: 'Google Ads', deClics: ['search', 'display'], llegada: 0.88, movil: 0.7 },
      { id: 'redesPagadas', nombre: 'Redes con pauta', deClics: ['meta', 'tiktok'], llegada: 0.7, movil: 0.95 },
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
    { id: 'resetfit', nombre: 'Reset Fit', base: 120, propia: true, crece: 0.95 },
    { id: 'otros', nombre: 'Otros', base: 420 },
  ],

  // Búsquedas: índice semanal tipo Trends, normalizado al máximo del conjunto = 100
  busquedas: [
    { id: 'gimnasio', termino: 'gimnasio', base: 100 },
    { id: 'cerca', termino: 'gimnasio cerca de mí', base: 62, crece: 0.25 },
    { id: 'precio', termino: 'precio gimnasio', base: 38 },
    { id: 'personal', termino: 'entrenador personal', base: 22, crece: 0.35 },
    { id: 'spinning', termino: 'clases de spinning', base: 18, crece: -0.15 },
    { id: 'marca', termino: 'reset fit', base: 9, crece: 0.9, propia: true },
  ],

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
    coberturaMinima: 0.6, // un delta se publica con al menos 60 % de días medidos en las dos ventanas
    casosMinimos: 30, // una tasa con menos casos en el denominador se marca «pocos casos»
    bandasIndice: [{ hasta: 40, nombre: 'baja' }, { hasta: 70, nombre: 'media' }, { hasta: 100, nombre: 'alta' }], // asumo
    bandasCpl: [{ fraccion: 0.85, nombre: 'holgado' }, { fraccion: 1, nombre: 'en meta' }], // asumo
    elasticidad: { central: 0.8, baja: 0.7, alta: 0.9 }, // asumo: leads ∝ inversión^β al mover presupuesto
    mejoraAgendamiento: 0.05, // asumo: escenario de +5 puntos en la tasa de cita
    mesesProyeccion: 3,
  },
};
