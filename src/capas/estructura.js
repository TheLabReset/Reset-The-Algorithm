// Las tres capas de The Algorithm y sus secciones. Para otro cliente se agrega o se quita una sección aquí,
// sin tocar los componentes. Cada sección declara sus universos (qué cuenta) y las fuentes que la alimentan.

export const CAPAS = [
  {
    id: 'lee', numero: '1', nombre: 'Lee', descripcion: 'Lo que dice cada fuente, por separado',
    titulo: 'Lo que dice cada fuente', bajada: 'Cada fuente por separado y sin opinar. Una sección por fuente; adentro, el detalle de cada plataforma.',
    secciones: [
      { id: 's-1-1', numero: '1.1', titulo: 'Pauta pagada', pregunta: '¿Cuánto se invirtió y qué reportan las plataformas?', universos: ['pauta'], fuentes: ['meta', 'search', 'tiktok', 'display'] },
      { id: 's-1-2', numero: '1.2', titulo: 'CRM', pregunta: '¿Cuántos leads llegaron, de dónde y qué pasó con ellos?', universos: ['crm'], fuentes: ['crm'] },
      { id: 's-1-3', numero: '1.3', titulo: 'Búsquedas en Google', pregunta: '¿Cuánto interés hay y en qué palabras?', universos: ['busquedas'], fuentes: ['busquedas'] },
      { id: 's-1-4', numero: '1.4', titulo: 'Redes', pregunta: '¿De qué se habla en TikTok y qué se dice de Reset Fit?', universos: ['conversacion'], fuentes: ['conversacion'] },
      { id: 's-1-5', numero: '1.5', titulo: 'Competencia', pregunta: '¿Qué tan activos están los otros gimnasios?', universos: ['conversacion'], fuentes: ['conversacion'] },
      { id: 's-1-6', numero: '1.6', titulo: 'Sitio web', pregunta: '¿Quién entra al sitio, desde dónde y qué mira?', universos: ['web'], fuentes: ['web'] },
    ],
  },
  {
    id: 'analiza', numero: '2', nombre: 'Analiza', descripcion: 'Lo que aparece al cruzar fuentes',
    titulo: 'Lo que aparece al cruzar fuentes', bajada: 'Cada sección dice qué cruza con qué. Lo que viene de universos distintos se compara, nunca se suma.',
    secciones: [
      { id: 's-2-1', numero: '2.1', titulo: 'Reparto de la inversión', pregunta: '¿Dónde está la plata y cómo va contra el plan?', universos: ['pauta', 'plan'], fuentes: ['meta', 'search', 'tiktok', 'display'] },
      { id: 's-2-2', numero: '2.2', titulo: 'De la pauta al CRM', pregunta: '¿Lo que reportan las plataformas llega al CRM? ¿Qué canal inscribe más barato?', universos: ['pauta', 'crm'], fuentes: ['meta', 'search', 'tiktok', 'display', 'crm'] },
      { id: 's-2-3', numero: '2.3', titulo: 'Demanda y respuesta', pregunta: '¿Los leads siguen al interés de búsqueda?', universos: ['busquedas', 'pauta'], fuentes: ['busquedas', 'meta', 'search', 'tiktok', 'display'] },
      { id: 's-2-4', numero: '2.4', titulo: 'Cuándo entra el lead', pregunta: '¿A qué hora y qué día llegan los leads?', universos: ['crm'], fuentes: ['crm'] },
      { id: 's-2-5', numero: '2.5', titulo: 'Dónde crece', pregunta: '¿Qué sedes reciben más leads y cuáles inscriben mejor?', universos: ['crm'], fuentes: ['crm'] },
    ],
  },
  {
    id: 'sugiere', numero: '3', nombre: 'Sugiere', descripcion: 'Qué mirar y qué mover',
    titulo: 'Qué mirar y qué mover', bajada: 'Cada sugerencia dice qué la sostiene. Las estimaciones van con su rango y sus supuestos.',
    secciones: [
      { id: 's-3-1', numero: '3.1', titulo: 'Índice de oportunidad', pregunta: '¿Qué tan favorable está el mercado para captar socios?', universos: ['modelo'], fuentes: [] },
      { id: 's-3-2', numero: '3.2', titulo: 'Qué mirar', pregunta: '¿Qué se salió de lo esperado en la última lectura?', universos: ['modelo'], fuentes: [] },
      { id: 's-3-3', numero: '3.3', titulo: 'Sugerencias', pregunta: '¿Qué mover y cuánto podría dar?', universos: ['modelo'], fuentes: [] },
      { id: 's-3-4', numero: '3.4', titulo: 'Pilares de contenido', pregunta: '¿De qué conviene hablar, según los estudios?', universos: ['modelo'], fuentes: [] },
      { id: 's-3-5', numero: '3.5', titulo: 'Escenario si nada cambia', pregunta: '¿Cuántos leads habría si la inversión sigue el plan?', universos: ['modelo'], fuentes: ['meta', 'search', 'tiktok', 'display'] },
    ],
  },
];

export const seccion = (id) => CAPAS.flatMap((c) => c.secciones).find((s) => s.id === id);
export const seccionPorNumero = (n) => CAPAS.flatMap((c) => c.secciones).find((s) => s.numero === n);
