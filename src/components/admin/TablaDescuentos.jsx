import { fechaDeDia, hoy } from '../../utils/formato'
import { textoValorDescuento } from '../../utils/descuentos'
import BotonConfirmar from '../comunes/BotonConfirmar'
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
                <button className="boton boton-secundario" onClick={() => onAlternar(d)} disabled={guardando}>
                  {d.activo ? 'Pausar' : 'Activar'}
                </button>
                <BotonConfirmar texto="Eliminar" disabled={guardando} onConfirmar={() => onEliminar(d)} />
              </td>
            </tr>
          ))}
        </TablaGestion>
      )}
    </section>
  )
}

export default TablaDescuentos
