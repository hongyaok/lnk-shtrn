import { CheckCircle2, QrCode, Download, Link, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import { Button } from './ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortLink: string;
}

export default function ShareModal({ isOpen, onClose, shortLink }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (!shortLink) return;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyQRCode = async () => {
    const canvas = document.getElementById('qr-canvas-modal') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy QR code', err);
      }
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas-modal') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = 'qrcode.png';
      a.href = url;
      a.click();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1.5rem', position: 'relative', width: '90%', maxWidth: '400px'
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <X size={24} />
        </button>

        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, fontFamily: "'Pixelify Sans', sans-serif" }}>Your Link is Ready</h2>

        <div style={{ position: 'relative', padding: '1rem', background: '#fff', borderRadius: '0.5rem' }}>
          <QRCodeCanvas
            id="qr-canvas-modal"
            value={shortLink}
            size={200}
          />
          <button
            type="button"
            onClick={downloadQR}
            style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
              borderRadius: '0.25rem', padding: '0.25rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.8, transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            title="Download QR Code"
          >
            <Download size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={copyToClipboard}
            style={{
              flex: 1,
              background: copied ? '#22c55e' : undefined,
              color: copied ? '#ffffff' : undefined,
              borderColor: copied ? '#22c55e' : undefined
            }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Link size={18} />}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={copyQRCode}
            style={{
              flex: 1,
              background: qrCopied ? '#22c55e' : undefined,
              color: qrCopied ? '#ffffff' : undefined,
              borderColor: qrCopied ? '#22c55e' : undefined
            }}
          >
            {qrCopied ? <CheckCircle2 size={18} /> : <QrCode size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
