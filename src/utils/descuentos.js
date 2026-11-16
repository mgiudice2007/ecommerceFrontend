import { precio } from './formato'

export const textoValorDescuento = (d) => (d.tipoDescuento === 'PORCENTAJE' ? `${Number(d.valor)}%` : precio(d.valor))
