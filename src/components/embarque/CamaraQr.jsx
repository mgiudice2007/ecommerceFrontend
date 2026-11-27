import { Scanner, setZXingModuleOverrides } from '@yudiel/react-qr-scanner'
import lectorQrWasm from 'zxing-wasm/reader/zxing_reader.wasm?url'
import './CamaraQr.css'

// Si el navegador no trae lector de QR propio (Chrome en Windows), la librería usa uno en WebAssembly y por
// defecto lo baja de un CDN. Así lo sirve nuestra app (Vite lo copia al build) y el lector anda sin internet.
setZXingModuleOverrides({
  locateFile: (archivo, prefijo) => (archivo.endsWith('.wasm') ? lectorQrWasm : prefijo + archivo),
})

// Qué decirle al administrador según por qué no arrancó la cámara (la librería clasifica el error en `kind`)
const MENSAJES = {
  'permission-denied': 'No se dio permiso para usar la cámara. Habilitalo en el candado de la barra de direcciones.',
  'no-camera': 'No se encontró ninguna cámara en este dispositivo.',
  'in-use': 'La cámara la está usando otra aplicación.',
  'insecure-context': 'La cámara solo funciona en localhost o con https.',
  unsupported: 'Este navegador no permite usar la cámara.',
}

// Cámara que lee el QR del pase. La librería maneja el video y la cámara (sin window ni document en nuestro
// código); este componente solo avisa al padre lo que leyó o por qué no pudo.
function CamaraQr({ onLeer, onError }) {
  const leer = (codigos) => {
    if (codigos.length > 0) onLeer(codigos[0].rawValue)
  }

  const fallar = (error) => onError(MENSAJES[error.kind] ?? 'No se pudo usar la cámara.')

  return (
    <div className="camara-qr">
      <Scanner
        onScan={leer}
        onError={fallar}
        formats={['qr_code']}
        components={{ finder: true, torch: false, onOff: false, zoom: false }}
        sound
        styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
      />
    </div>
  )
}

export default CamaraQr
