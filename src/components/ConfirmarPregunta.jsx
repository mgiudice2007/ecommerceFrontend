import Confirmacion from './Confirmacion'

// Muestra la pregunta pendiente (o nada). pregunta: { titulo, mensaje, detalle, textoConfirmar, peligro, accion }.
function ConfirmarPregunta({ pregunta, onCerrar }) {
  if (!pregunta) return null

  return (
    <Confirmacion
      titulo={pregunta.titulo}
      mensaje={pregunta.mensaje}
      detalle={pregunta.detalle}
      textoConfirmar={pregunta.textoConfirmar}
      peligro={pregunta.peligro}
      onConfirmar={() => {
        onCerrar()
        pregunta.accion()
      }}
      onCancelar={onCerrar}
    />
  )
}

export default ConfirmarPregunta
