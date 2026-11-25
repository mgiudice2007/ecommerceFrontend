import { QRCodeSVG } from 'qrcode.react'
import './CodigoQr.css'

// Dibuja el QR de lo que recibe (la librería arma un SVG, no usa cámara ni nada del navegador)
function CodigoQr({ valor, titulo, lado = 112 }) {
  return (
    <div className="codigo-qr">
      <QRCodeSVG value={valor} size={lado} level="M" title={titulo} />
    </div>
  )
}

export default CodigoQr
