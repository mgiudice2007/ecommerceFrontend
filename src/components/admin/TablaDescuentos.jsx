import { useState } from 'react'
import { fechaDeDia, hoy } from '../../utils/formato'
import { textoValorDescuento } from '../../utils/descuentos'
import ConfirmarPregunta from '../ConfirmarPregunta'
import Etiqueta from '../comunes/Etiqueta'
import SinDatos from '../comunes/SinDatos'
import TablaGestion from '../comunes/TablaGestion'

function EstadoDescuento({ descuento }) {
  if (descuento.vigente) return <Etiqueta tipo="exito">Vigente hoy</Etiqueta>
  if (!descuento.activo) return <Etiqueta tipo="cancelada">Pausado</Etiqueta>
  if (descuento.fechaHasta < hoy()) return <Etiqueta>Vencido</Etiqueta>
  return <Etiqueta tipo="aviso">Programado</Etiqueta>
}

function TablaDescuentos({ descuentos, guardando, onAlternar, onEliminar }) {
  const [pregunta, setPregunta] = useState(null)

  const preguntarAlternar = (d) => {
    setPregunta({
      titulo: `¿${d.activo ? 'Pausar' : 'Activar'} el descuento de ${textoValorDescuento(d)}?`,
      mensaje: d.activo
        ? 'Mientras esté pausado no se aplica al precio del vuelo.'
        : 'Vuelve a aplicarse al precio del vuelo en sus fechas.',
      textoConfirmar: d.activo ? 'Sí, pausar' : 'Sí, activar',
      accion: () => onAlternar(d),
    })
  }

  const preguntarEliminar = (d) => {
    setPregunta({
      titulo: '¿Eliminar este descuento?',
      mensaje: 'Las compras ya hechas mantienen su precio.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => onEliminar(d),
    })
  }

  return (
    <section className="tarjeta">
      <h2>Descuentos del vuelo</h2>
      <p className="texto-suave">
        El descuento vigente se resta del precio de todas las clases. Las compras ya hechas no cambian.
      </p>

      {descuentos.length === 0 ? (
        <SinDatos>Este vuelo no tiene descuentos.</SinDatos>
      ) : (
        <TablaGestion columnas={['Descuento', 'Desde', 'Hasta', 'Estado']}>
          {descuentos.map((d) => (
            <tr key={d.id}>
              <td>
                <strong>{textoValorDescuento(d)} OFF</strong>
              </td>
              <td>{fechaDeDia(d.fechaDesde)}</td>
              <td>{fechaDeDia(d.fechaHasta)}</td>
              <td>
                <EstadoDescuento descuento={d} />
              </td>
              <td className="acciones">
                <button className="boton boton-secundario" onClick={() => preguntarAlternar(d)} disabled={guardando}>
                  {d.activo ? 'Pausar' : 'Activar'}
                </button>
                <button className="boton boton-peligro" onClick={() => preguntarEliminar(d)} disabled={guardando}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </TablaGestion>
      )}

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default TablaDescuentos
