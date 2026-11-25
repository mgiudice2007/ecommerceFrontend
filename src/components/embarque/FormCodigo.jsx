import Campo from '../comunes/Campo'
import './FormCodigo.css'

// Formulario controlado desde afuera: el código que se escribe y la búsqueda viven en la vista
function FormCodigo({ codigo, buscando, onCambiar, onBuscar }) {
  const buscar = (e) => {
    e.preventDefault()
    onBuscar()
  }

  return (
    <form className="form-codigo" onSubmit={buscar}>
      <Campo id="codigoEmbarque" etiqueta="Código del pase" ayuda="Está debajo del QR, por ejemplo BCA-7F3K9QXM.">
        <input
          id="codigoEmbarque"
          name="codigoEmbarque"
          autoComplete="off"
          autoFocus
          value={codigo}
          onChange={(e) => onCambiar(e.target.value)}
          placeholder="BCA-XXXXXXXX"
          required
        />
      </Campo>
      <button className="boton boton-primario" disabled={buscando || !codigo.trim()}>
        {buscando ? 'Buscando…' : 'Validar pase'}
      </button>
    </form>
  )
}

export default FormCodigo
