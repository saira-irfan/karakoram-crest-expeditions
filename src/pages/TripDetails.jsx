import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { usePlan } from '../context/PlanContext.jsx';
import { checkGroupSize, checkDeadline, MAX_GROUP, GROUP_DISCOUNT_THRESHOLD } from '../utils/rules.js';
import ImageWithFallback from '../components/ImageWithFallback.jsx';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, status, errorMessage, load, items, addTrip, now } = usePlan();

  const existingPlanItem = items.find(item => item.id === id);
  const [travellers, setTravellers] = useState(existingPlanItem ? existingPlanItem.travellers : 1);
  const [justAddedFeedback, setJustAddedFeedback] = useState(false);

  useEffect(() => {
    if (existingPlanItem) {
      setTravellers(existingPlanItem.travellers);
    }
  }, [existingPlanItem]);

  if (status === 'loading') {
    return (
      <div className="status-box" role="status">
        <div className="spinner" aria-hidden="true"></div>
        <h2>Loading trip details...</h2>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="status-box error-box" role="alert">
        <FiAlertCircle className="status-icon text-danger" />
        <h2>Could not load trip</h2>
        <p>{errorMessage}</p>
        <button type="button" className="btn btn-primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const trip = trips.find(t => t.id === id);

  // Invalid ID handling (FR02)
  if (!trip) {
    return (
      <div className="status-box" role="region" aria-label="Trip not found">
        <h2>Trip Not Found</h2>
        <p>No trip exists with the ID <code>&ldquo;{id}&rdquo;</code>.</p>
        <Link to="/" className="btn btn-primary">
          <FiArrowLeft /> Back to all trips
        </Link>
      </div>
    );
  }

  const sizeValidation = checkGroupSize(travellers, trip.seats);
  const deadlineCheck = checkDeadline(trip.departure, now);
  const isSoldOut = trip.seats <= 0;
  const isBookingClosed = !deadlineCheck.ok;
  const canBook = sizeValidation.ok && !isSoldOut && !isBookingClosed;

  // Real-time calculation preview
  const subtotal = trip.price * (travellers || 0);
  const qualifiesDiscount = travellers >= GROUP_DISCOUNT_THRESHOLD;
  const discountAmount = qualifiesDiscount ? Math.round(subtotal * 0.10) : 0;
  const estimatedTotal = subtotal - discountAmount;
  const estimatedDeposit = Math.round(estimatedTotal * 0.30);

  const handleTravellerChange = delta => {
    setTravellers(prev => Math.max(1, Math.min(MAX_GROUP, (prev || 1) + delta)));
  };

  const handleAddOrUpdate = () => {
    if (!canBook) return;
    addTrip(trip.id, travellers);
    setJustAddedFeedback(true);
    setTimeout(() => setJustAddedFeedback(false), 3000);
  };

  const departureDateFormatted = new Date(trip.departure).toLocaleString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="details-page">
      <div className="back-bar">
        <button 
          type="button" 
          className="btn-back" 
          onClick={() => navigate(-1)}
          aria-label="Return to previous page"
        >
          <FiArrowLeft /> Back to trips
        </button>
      </div>

      <div className="details-header">
        <div className="title-area">
          <div className="pill-group">
            <span className="badge-tag">{trip.region}</span>
            <span className={`pill-diff pill-${trip.difficulty.toLowerCase()}`}>
              {trip.difficulty} Difficulty
            </span>
            <span className="badge-tag">Elevation: {trip.elevation}</span>
          </div>
          <h1>{trip.title}</h1>
          <p className="details-intro">{trip.description}</p>
        </div>
      </div>

      <div className="details-grid">
        {/* Main content */}
        <div className="details-main">
          <div className="main-photo-wrap">
            <ImageWithFallback
              src={trip.image}
              alt={trip.title}
              className="main-photo"
              fallbackText={trip.region}
            />
          </div>

          <section className="info-section">
            <h2>Trip Details & Logistics</h2>
            <dl className="details-list">
              <div className="list-row">
                <dt>Departure time</dt>
                <dd>{departureDateFormatted}</dd>
              </div>
              <div className="list-row">
                <dt>Pickup location</dt>
                <dd>{trip.pickup}</dd>
              </div>
              <div className="list-row">
                <dt>Minimum age</dt>
                <dd>
                  <strong>{trip.minAge} years or older</strong>
                  <span className="help-text">
                    {trip.minAge >= 16 ? '(Strenuous alpine hike)' : '(Suitable for beginners and students)'}
                  </span>
                </dd>
              </div>
              <div className="list-row">
                <dt>Booking deadline</dt>
                <dd>
                  {isBookingClosed ? (
                    <span className="text-danger">Closed — {deadlineCheck.message}</span>
                  ) : (
                    <span>Closes 72 hours before departure ({deadlineCheck.hoursRemaining} hours left)</span>
                  )}
                </dd>
              </div>
              <div className="list-row">
                <dt>Included in fare</dt>
                <dd>{trip.includes}</dd>
              </div>
            </dl>
          </section>

          <section className="info-section">
            <h2>Trip Itinerary</h2>
            <ol className="itinerary-list">
              {trip.itinerary && trip.itinerary.map((item, idx) => (
                <li key={idx}>
                  <span className="step-num">{idx + 1}</span>
                  <span className="step-text">{item}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar Booking Box */}
        <aside className="details-aside">
          <div className="booking-box">
            <div className="price-header">
              <span className="main-price">Rs {trip.price.toLocaleString()}</span>
              <span className="price-unit">per person / {trip.days} day{trip.days > 1 ? 's' : ''}</span>
            </div>

            {/* Availability status banner */}
            {isSoldOut ? (
              <div className="status-banner banner-danger" role="alert">
                Sold Out — all seats reserved.
              </div>
            ) : isBookingClosed ? (
              <div className="status-banner banner-danger" role="alert">
                Booking Closed — reservations close 72h before departure.
              </div>
            ) : trip.seats <= 4 ? (
              <div className="status-banner banner-warning" role="alert">
                Only {trip.seats} seats remaining.
              </div>
            ) : (
              <div className="status-banner banner-success">
                {trip.seats} seats available.
              </div>
            )}

            <div className="form-item">
              <label htmlFor="travellers-count">
                Number of travellers (max {Math.min(MAX_GROUP, trip.seats)})
              </label>
              <div className="stepper-control">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => handleTravellerChange(-1)}
                  disabled={travellers <= 1 || isSoldOut || isBookingClosed}
                  aria-label="Decrease traveller count"
                >
                  <FiMinus />
                </button>
                <input
                  id="travellers-count"
                  type="number"
                  min="1"
                  max={Math.min(MAX_GROUP, trip.seats)}
                  value={travellers}
                  onChange={e => setTravellers(Number(e.target.value))}
                  disabled={isSoldOut || isBookingClosed}
                  className="step-input"
                  aria-invalid={!sizeValidation.ok}
                />
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => handleTravellerChange(1)}
                  disabled={travellers >= Math.min(MAX_GROUP, trip.seats) || isSoldOut || isBookingClosed}
                  aria-label="Increase traveller count"
                >
                  <FiPlus />
                </button>
              </div>

              {!sizeValidation.ok && (
                <p className="field-error" role="alert">
                  {sizeValidation.message}
                </p>
              )}
            </div>

            {/* Price Breakdown Calculation */}
            <div className="calculation-box">
              <div className="calc-row">
                <span>Fare ({travellers} × Rs {trip.price.toLocaleString()}):</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>

              {qualifiesDiscount ? (
                <div className="calc-row text-success">
                  <span>Group discount (10% off for 5+ people):</span>
                  <span>−Rs {discountAmount.toLocaleString()}</span>
                </div>
              ) : (
                <div className="discount-note">
                  Bring {GROUP_DISCOUNT_THRESHOLD - travellers} more friend{GROUP_DISCOUNT_THRESHOLD - travellers === 1 ? '' : 's'} to get 10% group discount.
                </div>
              )}

              <div className="calc-row calc-total">
                <strong>Total:</strong>
                <strong>Rs {estimatedTotal.toLocaleString()}</strong>
              </div>

              <div className="calc-row calc-deposit">
                <small>30% deposit due at departure:</small>
                <strong>Rs {estimatedDeposit.toLocaleString()}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!canBook}
              onClick={handleAddOrUpdate}
            >
              {existingPlanItem ? 'Update in Plan' : 'Add to Plan'}
            </button>

            {justAddedFeedback && (
              <div className="feedback-message" role="status">
                <FiCheck /> {existingPlanItem ? 'Updated in plan' : 'Added to plan'}
              </div>
            )}

            {existingPlanItem && (
              <div className="plan-reminder">
                <span>Currently in your plan ({existingPlanItem.travellers} traveller{existingPlanItem.travellers > 1 ? 's' : ''})</span>
                <Link to="/plan" className="btn btn-secondary btn-sm">
                  Go to Plan
                </Link>
              </div>
            )}

            <p className="disclaimer-text">
              Simulated booking for university assignment. No payment required.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
