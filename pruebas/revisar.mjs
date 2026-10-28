// Chequeos del texto que se ve en pantalla, compartidos por las pruebas de render: números rotos, rayas largas,
// relleno que explica la pantalla y las palabras que el glosario de medios veta (docs/guia-algoritmo.md, «Glosario»).

// Relleno: textos que explican la pantalla en vez de decir algo de la data, o jerga interna que el cliente no usa
export const RELLENO = [
  [/\bun clic (?:muestra|abre)|haz clic|pasa el mouse/i, 'explica cómo usar la pantalla'],
  [/en la misma escala/i, 'explica la escala'],
  [/pipeline|netlify|api_key|secrets|\/api\/|\bprops?\b/i, 'jerga interna'],
  [/cabe destacar|es importante señalar|en definitiva|asimismo/i, 'muletilla'],
];

// El glosario de medios: cada palabra que no se dice, con la que va en su lugar. Si se agrega una fila al glosario de la
// guía, se agrega aquí su chequeo (y al revés)
export const GLOSARIO = [
  { no: /\bplata\b/i, se: 'inversión, monto o dinero', por: 'suena a dinero sucio' },
  { no: /\bgente\b/i, se: 'público, usuarios, leads o clientes, según el caso', por: 'no dice a quién se mide' },
  { no: /\bpaneles\b/i, se: 'elementos (OOH)', por: 'en OOH se dice elemento; «panel» queda para el tablero y el panel de detalle' },
  { no: /\bal aire\b/i, se: 'activa o publicada (digital); con presencia (OOH)', por: '«al aire» es televisión y radio' },
  { no: /\b(?:bajar|baja|bajó|recortar|recorta|recortó)\w* (?:la |su )?inversión\b/i, se: 'disminuir la inversión', por: 'la inversión se aumenta o se disminuye' },
  { no: /\b(?:movió|movilizó|generó|mueve|moviliza|genera) \$/i, se: 'el verbo de lo que mide la fuente (invirtió, gastó, vendió)', por: 'un monto lleva su verbo exacto' },
  { no: /\baprovech/i, se: 'lo que decide la marca', por: 'el público no es alguien a quien acechar' },
  { no: /—/, se: 'punto, coma, dos puntos o paréntesis', por: 'raya larga' },
];

// Lo que se ve en pantalla: sin cálculos rotos, sin relleno y sin palabras vetadas. Devuelve cada problema con su contexto
export function textoRoto(t) {
  const out = [];
  const contexto = (i, largo) => t.slice(Math.max(0, i - 40), i + largo + 40).replace(/\s+/g, ' ').trim();
  const reglas = [
    [/undefined|NaN|\bnull\b|Infinity|\[object|Invalid Date/g, 'cálculo roto'],
    [/\d %/g, 'espacio que corta la cifra de su «%»'],
    ...RELLENO.map(([r, por]) => [new RegExp(r.source, 'gi'), por]),
    ...GLOSARIO.map((g) => [new RegExp(g.no.source, 'gi'), `glosario: se dice ${g.se} (${g.por})`]),
  ];
  for (const [re, por] of reglas) for (const m of t.matchAll(re)) out.push(`${por}: «${contexto(m.index, m[0].length)}»`);
  return out;
}

// El texto que se lee de un HTML: sin etiquetas, con los atributos que se leen en voz alta o al pasar el mouse
export const textoDe = (html) => [...html.matchAll(/(?:aria-label|title)="([^"]*)"/g)].map((m) => m[1]).join(' \n') + ' \n' + html.replace(/<[^>]+>/g, ' \n');
