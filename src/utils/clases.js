import { precio } from './formato'

export const claseDe = (clases, claseId) => clases.find((c) => String(c.id) === String(claseId))

// Entre que precios tiene que quedar una clase: no puede costar menos que una clase mas basica
// del mismo vuelo ni mas que una mejor. idQueSeEdita deja afuera a la propia fila.
export const rangoDePrecio = (vuelo, clases, claseId, idQueSeEdita) => {
  const nivel = claseDe(clases, claseId)?.nivel
  let desde = null
  let hasta = null
  vuelo.disponibilidades.forEach((d) => {
    const otroNivel = claseDe(clases, d.claseId)?.nivel
    if (d.id === idQueSeEdita || !nivel || !otroNivel) return
    if (otroNivel < nivel && (desde === null || d.precio > desde)) desde = d.precio
    if (otroNivel > nivel && (hasta === null || d.precio < hasta)) hasta = d.precio
  })
  return { desde, hasta }
}

export const textoRango = ({ desde, hasta }) => {
  if (desde !== null && hasta !== null) return `Entre ${precio(desde)} y ${precio(hasta)}, por las otras clases del vuelo.`
  if (desde !== null) return `Desde ${precio(desde)}: no puede costar menos que una clase más básica.`
  if (hasta !== null) return `Hasta ${precio(hasta)}: no puede costar más que una clase mejor.`
  return ''
}
