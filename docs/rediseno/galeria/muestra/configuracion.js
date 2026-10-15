// Configuración de la data de muestra. Todo número que el generador usa como parámetro
// vive acá, con su origen. Los que dicen «asumo» no tienen fuente primaria.
// Fuentes: docs/rediseno/investigacion/06-data-verosimil.md

export const CONFIG = {
  semilla: 20260930,
  desde: '2025-01-01',
  corte: '2026-09-30', // fecha fija de la muestra: nunca Date.now()
  marca: { nombre: 'Vitalto', rubro: 'cadena de gimnasios', ciudad: 'Lima' }, // nombre de trabajo, verificado sin homónimo en Perú (falta Indecopi)
  moneda: 'S/',

  // Índice mensual de «gimnasio» en Perú, Google Trends 2022-2025, media anual = 1 (confirmé, informe 06 §4.4)
  estacionalidad: [1.24, 1.14, 1.01, 0.89, 0.93, 0.87, 0.96, 1.08, 0.98, 0.96, 0.94, 1.0],
  // Leads por día de la semana, lunes a domingo (asumo: las búsquedas son planas, el formulario se llena menos el fin de semana)
  diaSemana: [1.05, 1.04, 1.02, 1.0, 0.95, 0.96, 0.98],
  factorFeriado: 0.78, // asumo: el lead baja en feriado aunque la búsqueda suba

  feriados: [
    '2025-01-01', '2025-04-17', '2025-04-18', '2025-05-01', '2025-06-07', '2025-06-29', '2025-07-23', '2025-07-28', '2025-07-29',
    '2025-08-06', '2025-08-30', '2025-10-08', '2025-11-01', '2025-12-08', '2025-12-09', '2025-12-25',
    '2026-01-01', '2026-04-02', '2026-04-03', '2026-05-01', '2026-06-07', '2026-06-29', '2026-07-23', '2026-07-28', '2026-07-29',
    '2026-08-06', '2026-08-30',
  ],

  // Canales pagados. Costos en soles; CPL = CPM / (1000 · CTR · CVR), derivado, nunca fijado (informe 06 §4.3).
  // metaCpl: asumo. En una demo real la fija el cliente; sin meta del cliente, el bloque no dibuja meta.
  canales: [
    { id: 'meta', nombre: 'Meta', cpm: 12, ctr: 0.015, cvr: 0.08, reparto: 0.45, metaCpl: 12 },
    { id: 'search', nombre: 'Google Search', cpm: 90, ctr: 0.055, cvr: 0.07, reparto: 0.3, metaCpl: 25 },
    { id: 'tiktok', nombre: 'TikTok', cpm: 10, ctr: 0.009, cvr: 0.05, reparto: 0.15, metaCpl: 20 },
    { id: 'display', nombre: 'Google Display', cpm: 6, ctr: 0.004, cvr: 0.025, reparto: 0.1, metaCpl: 45 },
  ],
  presupuestoMensual: 60000, // asumo
  // La inversión sigue a la demanda: enero y febrero con más presupuesto (asumo)
  pesoPresupuestoMes: [1.3, 1.15, 1.0, 0.9, 0.9, 0.85, 0.95, 1.05, 1.0, 0.95, 0.95, 1.0],
  // El CPM sube por competencia en subasta en enero y noviembre a diciembre (asumo)
  presionSubasta: [1.15, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05, 1.0, 1.0, 1.0, 1.12, 1.18],

  // Embudo de cohorte: cada etapa es fracción binomial de la anterior (asumo, anclado a rangos de proveedores, informe 06 §4.2)
  embudo: { contacto: 0.78, cita: 0.42, asiste: 0.7, alta: 0.35, rezagoAltaMax: 14 },

  // 12 sedes; col y fila ubican la tesela del distrito (no es un mapa a escala)
  sedes: [
    { id: 'lo', distrito: 'Los Olivos', corto: 'Los Olivos', col: 1, fila: 0, zona: 'Lima Norte', peso: 0.9, abre: '2026-03-02' },
    { id: 'in', distrito: 'Independencia', corto: 'Independ.', col: 2, fila: 0, zona: 'Lima Norte', peso: 0.7 },
    { id: 'sm', distrito: 'San Miguel', corto: 'San Miguel', col: 0, fila: 1, zona: 'Lima Moderna', peso: 1.0 },
    { id: 'jm', distrito: 'Jesús María', corto: 'Jesús María', col: 1, fila: 1, zona: 'Lima Moderna', peso: 0.9 },
    { id: 'li', distrito: 'Lince', corto: 'Lince', col: 2, fila: 1, zona: 'Lima Moderna', peso: 0.8 },
    { id: 'mg', distrito: 'Magdalena del Mar', corto: 'Magdalena', col: 0, fila: 2, zona: 'Lima Moderna', peso: 0.85 },
    { id: 'si', distrito: 'San Isidro', corto: 'San Isidro', col: 1, fila: 2, zona: 'Lima Moderna', peso: 1.2 },
    { id: 'sb', distrito: 'San Borja', corto: 'San Borja', col: 2, fila: 2, zona: 'Lima Moderna', peso: 1.0 },
    { id: 'at', distrito: 'Ate', corto: 'Ate', col: 3, fila: 2, zona: 'Lima Este', peso: 0.75 },
    { id: 'mi', distrito: 'Miraflores', corto: 'Miraflores', col: 1, fila: 3, zona: 'Lima Moderna', peso: 1.4 },
    { id: 'su', distrito: 'Santiago de Surco', corto: 'Surco', col: 2, fila: 3, zona: 'Lima Moderna', peso: 1.3 },
    { id: 'lm', distrito: 'La Molina', corto: 'La Molina', col: 3, fila: 3, zona: 'Lima Este', peso: 1.0 },
  ],

  // Bandas de lectura (asumo: no hay norma; se declaran para que no sean números sueltos en la pantalla)
  bandasIndice: [{ hasta: 40, nombre: 'baja' }, { hasta: 70, nombre: 'media' }, { hasta: 100, nombre: 'alta' }],
  bandasCpl: [{ fraccion: 0.85, nombre: 'holgado' }, { fraccion: 1, nombre: 'en meta' }], // fracciones de la meta de cada canal

  // Hora del día en que entra el lead: perfiles de laborable y fin de semana (asumo; no hay fuente)
  perfilHora: {
    laborable: [1, 0.5, 0.3, 0.2, 0.3, 1.2, 3.2, 4.0, 3.4, 2.6, 2.4, 2.6, 3.4, 3.0, 2.4, 2.4, 2.8, 3.6, 4.6, 5.6, 5.8, 4.8, 3.2, 1.8],
    finDeSemana: [1.4, 0.8, 0.5, 0.3, 0.2, 0.3, 0.8, 1.8, 3.2, 4.4, 4.8, 4.6, 4.0, 3.4, 3.0, 2.8, 3.0, 3.2, 3.4, 3.6, 3.6, 3.2, 2.6, 1.8],
  },

  // Competencia: marcas reales, SOLO conversación social de muestra (menciones semanales que suman 100 % con «Otros»).
  // Sin sentimiento, sin market share, sin atributos (informe 06 §3.2).
  conversacion: [
    { id: 'smartfit', nombre: 'Smart Fit', base: 820, picos: { 7: 1.26, 12: 1.53 } },
    { id: 'b2', nombre: 'b2', base: 270, crece: -0.2 },
    { id: 'bioritmo', nombre: 'Bio Ritmo', base: 150 },
    { id: 'ko', nombre: 'KO', base: 115, crece: 0.15 },
    { id: 'megaforce', nombre: 'Mega Force', base: 110 },
    { id: 'vitalto', nombre: 'Vitalto', base: 120, propia: true, crece: 0.95 },
    { id: 'otros', nombre: 'Otros', base: 420 },
  ],

  // Búsquedas: índice semanal tipo Trends, normalizado al máximo del conjunto = 100
  busquedas: [
    { id: 'gimnasio', termino: 'gimnasio', base: 100 },
    { id: 'cerca', termino: 'gimnasio cerca de mí', base: 62, crece: 0.25 },
    { id: 'precio', termino: 'precio gimnasio', base: 38 },
    { id: 'spinning', termino: 'clases de spinning', base: 18, crece: -0.15 },
    { id: 'personal', termino: 'entrenador personal', base: 22, crece: 0.35 },
    { id: 'marca', termino: 'vitalto', base: 9, crece: 0.9 },
  ],

  // Eventos que la data cuenta y la pantalla anota
  eventos: [
    { fecha: '2025-01-06', tipo: 'campana', texto: 'Reto de enero 2025' },
    { fecha: '2026-01-05', tipo: 'campana', texto: 'Reto de enero 2026' },
    { fecha: '2026-03-02', tipo: 'sede', texto: 'Abre Los Olivos' },
    { fecha: '2026-07-14', tipo: 'caida', canal: 'meta', texto: 'Meta no entregó datos' },
    { fecha: '2026-09-08', tipo: 'creativo', canal: 'meta', texto: 'Nuevas piezas en Meta' },
  ],
};
