// Quién es el cliente y cómo habla su rubro. Es el único archivo que dice el nombre de la marca:
// las lecturas, las pantallas y el cálculo lo toman de acá. Para otro cliente se cambia este archivo
// (y la paleta en src/sistema/tokens.css, y el logo en public/marca). Una prueba falla si la marca
// aparece escrita en otro lado.
export const CLIENTE = {
  id: 'fitlab',
  nombre: 'Fit Lab',
  rubro: 'cadena de gimnasios',
  ciudad: 'Lima',
  busqueda: 'gimnasio', // la búsqueda principal en Google Trends; es el id de la primera palabra de busquedas en la configuración
  cliente: 'socio', // cómo se llama a quien compra: socio, alumno, paciente, cliente
  clientes: 'socios',
  rubroPlural: 'gimnasios', // con quién se compara la marca: «frente a otros gimnasios»
};
