import { Clock } from 'lucide-react';

export default function ExpiredPage() {
  return (
    <div className="expired-container">
      <div className="expired-card">
        <div className="expired-icon-wrapper">
          <Clock size={48} className="expired-icon" />
        </div>
        <h1 className="expired-title">Link Expired</h1>
        <p className="expired-message">
          The active duration for this link has passed. The owner may create a new one.
        </p>
        <a href="/" className="btn-primary" style={{ textDecoration: 'none', marginTop: '1.5rem' }}>
          Go to Home
        </a>
      </div>
    </div>
  );
}
