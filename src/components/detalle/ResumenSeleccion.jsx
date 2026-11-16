import { precio, precioOGratis } from '../../utils/formato'
import { precioPorTipo, TIPOS_PASAJERO, totalPasajeros, totalSeleccion } from '../../utils/pasajeros'
import FilaTotal from '../comunes/FilaTotal'
import SelectorPasajeros from '../SelectorPasajeros'

function FilaSeleccion({ rotulo, valor }) {
  return (
    <div className="detalle-resumen">
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  )
}

const textoTipo = (tipo, cantidad, unitario) => {
  const nombre = cantidad === 1 ? tipo.singular : tipo.titulo.toLowerCase()
  const porPasajero = precioPorTipo(unitario, tipo)
  return `${cantidad} ${nombre}${porPasajero > 0 ? ` × ${precioOGratis(porPasajero)}` : ''}`
}

function ResumenSeleccion({ clase, pasajeros, onCambiarPasajeros }) {
  const unitario = clase.precioConDescuento

  return (
    <>
      <FilaSeleccion rotulo="Clase" valor={clase.claseNombre} />
      <FilaSeleccion rotulo="Precio por pasajero" valor={precio(unitario)} />

      <h3 className="detalle-pasajeros-titulo">Pasajeros</h3>
      <SelectorPasajeros pasajeros={pasajeros} onChange={onCambiarPasajeros} maximo={clase.asientosDisponibles} />

      {TIPOS_PASAJERO.filter((t) => pasajeros[t.clave] > 0).map((t) => (
        <FilaSeleccion
          key={t.clave}
          rotulo={textoTipo(t, pasajeros[t.clave], unitario)}
          valor={precioOGratis(precioPorTipo(unitario, t) * pasajeros[t.clave])}
        />
      ))}

      <FilaTotal
        className="detalle-total"
        rotulo={`Total · ${totalPasajeros(pasajeros)} pasajes`}
        valor={precio(totalSeleccion(unitario, pasajeros))}
      />
    </>
  )
}

export default ResumenSeleccion
