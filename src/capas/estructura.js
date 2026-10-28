import { CLIENTE } from '../cliente.js';
// Las cuatro capas de The Algorithm y sus capítulos, en el orden en que trabaja la agencia: escuchar el mercado,
// leer lo que dice el modelo, activar la pauta y medir el resultado. Es el estándar de la guía general
// (docs/guia-algoritmo.md): para otro cliente se agrega o se quita un capítulo aquí, sin tocar los componentes.
// Cada capítulo declara sus universos (qué cuenta) y las fuentes que lo alimentan.

export const CAPAS = [
  {
    id: 'senales', numero: '1', nombre: 'Captura de señales', descripcion: 'Qué se busca, qué se publica y quién entra al sitio',
    titulo: 'Captura de señales', bajada: 'Qué se busca, qué se publica en el rubro y quién entra al sitio.',
    secciones: [
      { id: 's-1-1', numero: '1.1', titulo: 'Qué se busca y qué se publica', pregunta: '¿Cuánto interés hay en Google y qué se publica del rubro en TikTok?', universos: ['busquedas', 'conversacion'], fuentes: ['busquedas', 'conversacion'] },
      { id: 's-1-2', numero: '1.2', titulo: 'Quién entra al sitio', pregunta: '¿Cuántos usuarios entran, desde dónde y qué páginas miran?', universos: ['web'], fuentes: ['web'] },
    ],
  },
  {
    id: 'inteligencia', numero: '2', nombre: 'Inteligencia de mercado', descripcion: 'Si conviene invertir ahora y qué mirar',
    titulo: 'Inteligencia de mercado', bajada: `Si conviene invertir ahora para captar ${CLIENTE.clientes}, qué mirar y qué viene.`,
    secciones: [
      { id: 's-2-1', numero: '2.1', titulo: 'Lo que lee el modelo', pregunta: '¿Cómo está el mercado y qué conviene mirar en el período?', universos: ['modelo'], fuentes: [] },
      { id: 's-2-2', numero: '2.2', titulo: 'Temporada y escenario', pregunta: '¿Los leads siguen a la demanda y cuántos habría si nada cambia?', universos: ['busquedas', 'pauta', 'modelo'], fuentes: ['busquedas', 'google', 'meta', 'tiktok'] },
    ],
  },
  {
    id: 'activacion', numero: '3', nombre: 'Activación estratégica', descripcion: 'Dónde está la inversión y a qué costo',
    titulo: 'Activación estratégica', bajada: 'Dónde está puesta la inversión y a qué costo.',
    secciones: [
      { id: 's-3-1', numero: '3.1', titulo: 'Dónde está la inversión', pregunta: 'Cómo se reparte entre plataformas y productos, y qué propone el modelo.', universos: ['pauta', 'modelo'], fuentes: ['google', 'meta', 'tiktok'] },
      { id: 's-3-2', numero: '3.2', titulo: 'Cada plataforma', pregunta: 'Campañas, palabras y resultados de Google Ads, Meta Ads y TikTok Ads.', universos: ['pauta'], fuentes: ['google', 'meta', 'tiktok'] },
      { id: 's-3-3', numero: '3.3', titulo: 'Piezas y campañas', pregunta: 'Qué campañas, conjuntos y piezas rinden, cuáles se encarecen y qué es nuevo.', universos: ['pauta'], fuentes: ['google', 'meta', 'tiktok'] },
      { id: 's-3-4', numero: '3.4', titulo: 'Cuándo se visita el sitio', pregunta: 'Las horas y los días con más usuarios activos.', universos: ['web'], fuentes: ['web'] },
    ],
  },
  {
    id: 'rendimiento', numero: '4', nombre: 'Rendimiento y optimización', descripcion: 'Qué dio resultado en el período',
    titulo: 'Rendimiento y optimización', bajada: 'Qué dio resultado en el período.',
    secciones: [
      { id: 's-4-1', numero: '4.1', titulo: 'Cómo viene el período', pregunta: 'Leads, inversión y resultados, día por día.', universos: ['crm', 'pauta'], fuentes: ['crm', 'google', 'meta', 'tiktok'] },
      { id: 's-4-2', numero: '4.2', titulo: 'De la pauta al CRM', pregunta: 'Si lo que reportan las plataformas llega al CRM y cuál inscribe más barato.', universos: ['pauta', 'crm'], fuentes: ['google', 'meta', 'tiktok', 'crm'] },
      { id: 's-4-3', numero: '4.3', titulo: 'Dentro del CRM', pregunta: 'De dónde llegan los leads, dónde están hoy y cómo se los atendió.', universos: ['crm'], fuentes: ['crm'] },
      { id: 's-4-4', numero: '4.4', titulo: 'Cuándo y dónde', pregunta: 'A qué hora entran los leads y qué sedes inscriben mejor.', universos: ['crm'], fuentes: ['crm'] },
      { id: 's-4-5', numero: '4.5', titulo: 'La competencia', pregunta: `Dónde está ${CLIENTE.nombre} frente a otros ${CLIENTE.rubroPlural}.`, universos: ['conversacion'], fuentes: ['conversacion'] },
    ],
  },
];

export const seccion = (id) => CAPAS.flatMap((c) => c.secciones).find((s) => s.id === id);
export const seccionPorNumero = (n) => CAPAS.flatMap((c) => c.secciones).find((s) => s.numero === n);
