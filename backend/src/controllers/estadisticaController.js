import { Reporte } from '../models/Reporte.js';
import { aplicarVencimiento } from '../services/vencimientoService.js';

export async function obtenerEstadisticas(_req, res) {
  await aplicarVencimiento();

  const [resultado] = await Reporte.aggregate([
    { $match: { oculto: false } },
    {
      $facet: {
        total: [{ $count: 'cantidad' }],
        porCategoria: [
          { $group: { _id: '$categoria', cantidad: { $sum: 1 } } },
          { $lookup: { from: 'categorias', localField: '_id', foreignField: '_id', as: 'categoria' } },
          { $unwind: '$categoria' },
          {
            $project: {
              _id: 0,
              id: '$_id',
              nombre: '$categoria.nombre',
              color: '$categoria.color',
              cantidad: 1,
            },
          },
          { $sort: { cantidad: -1 } },
        ],
        porEstado: [
          { $group: { _id: '$estado', cantidad: { $sum: 1 } } },
          { $project: { _id: 0, estado: '$_id', cantidad: 1 } },
        ],
        topPersistentes: [
          { $match: { totalReconfirmaciones: { $gt: 0 } } },
          { $sort: { totalReconfirmaciones: -1, creadoEn: 1 } },
          { $limit: 5 },
          { $lookup: { from: 'categorias', localField: 'categoria', foreignField: '_id', as: 'categoria' } },
          { $unwind: '$categoria' },
          {
            $project: {
              _id: 0,
              id: '$_id',
              descripcion: 1,
              totalReconfirmaciones: 1,
              estado: 1,
              creadoEn: 1,
              categoria: { nombre: '$categoria.nombre', color: '$categoria.color' },
            },
          },
        ],
        porSemana: [
          {
            $group: {
              _id: {
                $dateTrunc: { date: '$creadoEn', unit: 'week', startOfWeek: 'monday', timezone: 'America/Bogota' },
              },
              cantidad: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, semana: '$_id', cantidad: 1 } },
        ],
      },
    },
  ]);

  const porEstado = { activo: 0, antiguo: 0 };
  for (const fila of resultado.porEstado) porEstado[fila.estado] = fila.cantidad;

  res.json({
    total: resultado.total[0]?.cantidad ?? 0,
    porCategoria: resultado.porCategoria,
    porEstado,
    topPersistentes: resultado.topPersistentes,
    porSemana: resultado.porSemana,
  });
}
