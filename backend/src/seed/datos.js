export const CATEGORIAS = [
  { clave: 'vias', nombre: 'Vías', color: '#EA580C' },
  { clave: 'basuras', nombre: 'Basuras y escombros', color: '#65A30D' },
  { clave: 'alumbrado', nombre: 'Alumbrado público', color: '#CA8A04' },
  { clave: 'inundaciones', nombre: 'Inundaciones', color: '#2563EB' },
  { clave: 'espacio-publico', nombre: 'Espacio público', color: '#DB2777' },
  { clave: 'otros', nombre: 'Otros', color: '#6B7280' },
];

export const AREA_POPAYAN = {
  type: 'Polygon',
  coordinates: [
    [
      [-76.66, 2.4],
      [-76.55, 2.4],
      [-76.55, 2.5],
      [-76.66, 2.5],
      [-76.66, 2.4],
    ],
  ],
};

export const CONFIGURACION_INICIAL = {
  vencimientoMinutos: 43200,
  diasEntreReconfirmaciones: 7,
  limiteDiario: 10,
  radioDuplicadoMetros: 30,
};

export const CANTIDAD_CUENTAS_DEMO = 10;
export const PASSWORD_DEMO = 'demo123';
