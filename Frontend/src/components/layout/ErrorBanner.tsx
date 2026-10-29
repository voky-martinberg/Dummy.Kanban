import './ErrorBanner.css'

export function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <p className="error" role="alert">
      {message}
      {onClose && <button className="error-close" onClick={onClose} aria-label="Stäng">×</button>}
    </p>
  )
}
