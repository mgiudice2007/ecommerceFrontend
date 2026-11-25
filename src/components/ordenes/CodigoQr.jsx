import { QRCodeSVG } from 'qrcode.react'
import './CodigoQr.css'

// Dibuja el QR de lo que recibe (la librería arma un SVG, no usa cámara ni nada del navegador)
function CodigoQr({ valor, rotulo, ayuda }) {
  return (
    <div className="codigo-qr">
      <div className="codigo-qr-imagen">
        <QRCodeSVG value={valor} size={132} level="M" title={rotulo} />
      </div>
      <div className="codigo-qr-texto">
        <strong>{rotulo}</strong>
        <small>{ayuda}</small>
      </div>
    </div>
  )
}

export default CodigoQr
