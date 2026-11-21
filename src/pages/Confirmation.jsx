import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiPrinter } from 'react-icons/fi';

export default function Confirmation() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="status-box" role="region" aria-label="No reservation found">
        <h2>No Active Booking Found</h2>
        <p>You have reached the confirmation page without submitting a booking.</p>
        <Link to="/" className="btn btn-primary">
          Browse Trips
        </Link>
      </div>
    );
  }

  const {
    referenceCode,
    customerName,
    phone,
    pickupPoint,
    youngestAge,
    summary,
    reservedTrips,
    timestamp
  } = state;

  const formattedDate = new Date(timestamp).toLocaleDateString('en-PK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="confirmation-page">
      <div className="confirmation-card print-voucher">
        {/* On-screen Banner & Official Printable Header */}
        <div className="confirmation-header">
          <FiCheckCircle className="check-icon screen-only" aria-hidden="true" />
          <div className="voucher-brand print-only">
            <h2>Karakoram Crest Treks</h2>
            <span className="voucher-title">Official Expedition Booking Voucher</span>
          </div>
          <h1>Booking Confirmed (Simulated)</h1>
          <p className="screen-only">Thank you, <strong>{customerName}</strong>. Your trip reservation has been recorded.</p>
        </div>

        <div className="confirmation-body">
          {/* Reference Badge */}
          <div className="booking-code-box">
            <span className="code-label">Booking Reference</span>
            <strong className="code-text">{referenceCode}</strong>
            <span className="code-date">Issued on {formattedDate}</span>
          </div>

          {/* Lead Traveller Info */}
          <div className="info-block">
            <h3>Lead Traveller & Pickup</h3>
            <div className="info-grid">
              <div>
                <span className="info-label">Name:</span>
                <span className="info-val">{customerName}</span>
              </div>
              <div>
                <span className="info-label">Mobile:</span>
                <span className="info-val">{phone}</span>
              </div>
              <div>
                <span className="info-label">Pickup Point:</span>
                <span className="info-val">{pickupPoint}</span>
              </div>
              <div>
                <span className="info-label">Youngest Traveller:</span>
                <span className="info-val">{youngestAge} years old</span>
              </div>
            </div>
          </div>

          {/* Booked Trips */}
          <div className="info-block">
            <h3>Reserved Trips</h3>
            <ul className="confirmed-list">
              {reservedTrips && reservedTrips.map((trip, idx) => (
                <li key={idx} className="confirmed-row">
                  <div>
                    <strong>{trip.title}</strong>
                    <div className="confirmed-sub">
                      {trip.region} • Departure: {new Date(trip.departure).toDateString()}
                    </div>
                  </div>
                  <div className="confirmed-fare">
                    <span>{trip.travellers} seat(s)</span>
                    <strong>Rs {(trip.pricePerPerson * trip.travellers).toLocaleString()}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Summary */}
          <div className="info-block">
            <h3>Payment Summary</h3>
            <div className="summary-table">
              <div className="summary-row">
                <span>Total Travellers:</span>
                <span>{summary.people}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Rs {summary.subtotal.toLocaleString()}</span>
              </div>
              {summary.discountApplied && (
                <div className="summary-row text-success">
                  <span>Group Discount (10% off):</span>
                  <span>−Rs {summary.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row row-total">
                <strong>Grand Total:</strong>
                <strong>Rs {summary.total.toLocaleString()}</strong>
              </div>
              <div className="summary-row row-deposit">
                <span>30% Deposit Due at Departure:</span>
                <strong>Rs {summary.deposit.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Printable Signature & Stamp block */}
          <div className="voucher-signatures print-only">
            <div className="sig-col">
              <span className="sig-line">________________________________</span>
              <span className="sig-label">Lead Traveller Signature</span>
            </div>
            <div className="sig-col">
              <span className="sig-line">________________________________</span>
              <span className="sig-label">Authorized Dispatch Officer</span>
            </div>
          </div>

          <div className="disclaimer-box" role="note">
            <strong>Demonstration Notice:</strong>
            <p>
              This is a demonstration booking portal. All reservations and transaction estimates are simulated for demo purposes.
            </p>
          </div>

          <div className="confirmation-actions screen-only">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              <FiPrinter /> Print Voucher
            </button>
            <Link to="/" className="btn btn-primary">
              Book another trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
