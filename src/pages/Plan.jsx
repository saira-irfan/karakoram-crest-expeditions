import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { usePlan } from '../context/PlanContext.jsx';
import { checkGroupSize, checkAge, checkDeadline, summarize, MAX_GROUP } from '../utils/rules.js';
import ImageWithFallback from '../components/ImageWithFallback.jsx';

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  youngestAge: '',
  pickupPoint: '',
  emergencyNotes: ''
};

export default function Plan() {
  const { trips, status, errorMessage, items, setQty, removeTrip, clearPlan, now } = usePlan();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  if (status === 'loading') {
    return (
      <div className="status-box" role="status">
        <div className="spinner" aria-hidden="true"></div>
        <h2>Loading your plan...</h2>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="status-box error-box" role="alert">
        <FiAlertCircle className="status-icon text-danger" />
        <h2>Could not verify plan items</h2>
        <p>{errorMessage}</p>
        <Link to="/" className="btn btn-primary">Return to trips</Link>
      </div>
    );
  }

  // Re-validate every saved selection against CURRENT live data (Task 6.1)
  const evaluatedLines = items.map(item => {
    const trip = trips.find(t => t.id === item.id);
    if (!trip) {
      return {
        id: item.id,
        travellers: item.travellers,
        trip: null,
        issues: ['This trip is no longer on the schedule. Please remove it from your plan.']
      };
    }

    const issues = [];
    const sizeCheck = checkGroupSize(item.travellers, trip.seats);
    if (!sizeCheck.ok) {
      issues.push(sizeCheck.message);
    }

    const deadlineCheck = checkDeadline(trip.departure, now);
    if (!deadlineCheck.ok) {
      issues.push(deadlineCheck.message);
    }

    return {
      id: item.id,
      travellers: item.travellers,
      trip,
      issues
    };
  });

  const validLines = evaluatedLines.filter(line => line.trip !== null);
  const summary = summarize(validLines);
  const hasUnresolvedIssues = evaluatedLines.some(line => line.issues.length > 0);

  // Controlled Form (FR09) - preserves valid fields on submit error (Decision 3)
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = {};

    if (!form.fullName || form.fullName.trim().length < 3) {
      validationErrors.fullName = 'Please enter your full name (at least 3 characters).';
    }

    const phoneRegex = /^03\d{2}-?\d{7}$/;
    if (!form.phone || !phoneRegex.test(form.phone.trim())) {
      validationErrors.phone = 'Please enter a valid Pakistani number like 0300-1234567.';
    }

    const ageVal = Number(form.youngestAge);
    if (!form.youngestAge || isNaN(ageVal) || ageVal < 1 || ageVal > 110) {
      validationErrors.youngestAge = 'Please enter an age between 1 and 110.';
    } else {
      for (const line of validLines) {
        const ageCheck = checkAge(ageVal, line.trip);
        if (!ageCheck.ok) {
          validationErrors.youngestAge = ageCheck.message;
          break;
        }
      }
    }

    if (!form.pickupPoint) {
      validationErrors.pickupPoint = 'Please select a pickup location.';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || hasUnresolvedIssues) {
      return;
    }

    const referenceCode = 'KCE-' + Math.floor(100000 + Math.random() * 900000);
    const bookingPayload = {
      referenceCode,
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      pickupPoint: form.pickupPoint,
      youngestAge: form.youngestAge,
      summary,
      reservedTrips: validLines.map(l => ({
        id: l.trip.id,
        title: l.trip.title,
        region: l.trip.region,
        departure: l.trip.departure,
        travellers: l.travellers,
        pricePerPerson: l.trip.price
      })),
      timestamp: new Date().toISOString()
    };

    navigate('/confirmation', { state: bookingPayload });
    clearPlan();
  };

  if (items.length === 0) {
    return (
      <div className="status-box empty-plan" role="region" aria-label="Empty plan">
        <h2>Your Plan is Empty</h2>
        <p>You haven’t added any trips to your plan yet.</p>
        <Link to="/" className="btn btn-primary">
          Browse Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="plan-page">
      <div className="page-intro">
        <h1>Review Plan & Book</h1>
        <p className="intro-text">
          Check your selected trips, confirm traveller counts, and complete your reservation details.
        </p>
      </div>

      {hasUnresolvedIssues && (
        <div className="status-banner banner-danger" role="alert">
          <FiAlertCircle />
          <span>One or more trips have issues below. Please adjust traveller counts or remove closed trips before confirming.</span>
        </div>
      )}

      <div className="plan-grid">
        {/* Left column: Selected trips */}
        <div className="plan-items-section">
          <div className="section-head">
            <h2>Selected Trips ({items.length})</h2>
            <button
              type="button"
              className="btn-link text-danger"
              onClick={clearPlan}
            >
              Clear all
            </button>
          </div>

          <ul className="plan-list">
            {evaluatedLines.map(line => {
              const trip = line.trip;
              const hasErrors = line.issues.length > 0;

              return (
                <li key={line.id} className={`plan-card ${hasErrors ? 'card-conflict' : ''}`}>
                  <div className="plan-card-thumb">
                    <ImageWithFallback
                      src={trip ? trip.image : ''}
                      alt={trip ? trip.title : 'Trip'}
                      className="thumb-img"
                      fallbackText={trip ? trip.region : 'Trip'}
                    />
                  </div>

                  <div className="plan-card-info">
                    <div className="plan-card-header">
                      <h3>
                        {trip ? <Link to={`/trips/${trip.id}`}>{trip.title}</Link> : `Trip ID: ${line.id}`}
                      </h3>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeTrip(line.id)}
                        aria-label={`Remove ${trip ? trip.title : line.id} from plan`}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>

                    {trip && (
                      <div className="plan-card-meta">
                        <span>{trip.region}</span>
                        <span className="dot">•</span>
                        <span>Rs {trip.price.toLocaleString()} / person</span>
                        <span className="dot">•</span>
                        <span>Min age: {trip.minAge}+</span>
                      </div>
                    )}

                    {trip && (
                      <div className="plan-stepper-wrap">
                        <span className="stepper-label">Travellers:</span>
                        <div className="stepper-control small-stepper">
                          <button
                            type="button"
                            className="step-btn"
                            onClick={() => setQty(line.id, Math.max(1, line.travellers - 1))}
                            disabled={line.travellers <= 1}
                            aria-label={`Decrease travellers for ${trip.title}`}
                          >
                            <FiMinus />
                          </button>
                          <span className="step-val">{line.travellers}</span>
                          <button
                            type="button"
                            className="step-btn"
                            onClick={() => setQty(line.id, Math.min(MAX_GROUP, line.travellers + 1))}
                            disabled={line.travellers >= Math.min(MAX_GROUP, trip.seats)}
                            aria-label={`Increase travellers for ${trip.title}`}
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <span className="line-total">
                          Rs {(trip.price * line.travellers).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {line.issues.map((issue, idx) => (
                      <div key={idx} className="line-error-msg" role="alert">
                        <FiAlertCircle /> {issue}
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="add-more-bar">
            <Link to="/" className="btn btn-secondary">
              + Add another trip
            </Link>
          </div>
        </div>

        {/* Right column: Summary and Form */}
        <aside className="plan-checkout-section">
          {/* Summary */}
          <div className="summary-box">
            <h2>Order Summary</h2>
            <div className="summary-table">
              <div className="summary-row">
                <span>Total travellers:</span>
                <span>{summary.people}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Rs {summary.subtotal.toLocaleString()}</span>
              </div>
              {summary.discountApplied ? (
                <div className="summary-row text-success">
                  <span>Group discount (10% off):</span>
                  <span>−Rs {summary.discount.toLocaleString()}</span>
                </div>
              ) : (
                <div className="summary-hint">
                  Add {5 - summary.people} more traveller(s) to unlock 10% group discount.
                </div>
              )}
              <div className="summary-row row-total">
                <strong>Grand Total:</strong>
                <strong>Rs {summary.total.toLocaleString()}</strong>
              </div>
              <div className="summary-row row-deposit">
                <span>30% Deposit due:</span>
                <strong>Rs {summary.deposit.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="form-box">
            <h2>Lead Traveller Details</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ali Ahmed"
                  className={`input-text ${errors.fullName ? 'has-error' : ''}`}
                />
                {errors.fullName && <p className="error-text">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Mobile (WhatsApp) *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="0300-1234567"
                  className={`input-text ${errors.phone ? 'has-error' : ''}`}
                />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="youngestAge">Age of Youngest Traveller *</label>
                <input
                  id="youngestAge"
                  name="youngestAge"
                  type="number"
                  min="1"
                  max="110"
                  value={form.youngestAge}
                  onChange={handleInputChange}
                  placeholder="e.g. 19"
                  className={`input-text ${errors.youngestAge ? 'has-error' : ''}`}
                />
                {errors.youngestAge && <p className="error-text">{errors.youngestAge}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupPoint">Pickup Hub *</label>
                <select
                  id="pickupPoint"
                  name="pickupPoint"
                  value={form.pickupPoint}
                  onChange={handleInputChange}
                  className={`input-select ${errors.pickupPoint ? 'has-error' : ''}`}
                >
                  <option value="">Select pickup point...</option>
                  <option value="F-6 Markaz (Super Market), Islamabad">
                    F-6 Markaz (Super Market), Islamabad
                  </option>
                  <option value="Rawalpindi Saddar (Metro Station)">
                    Rawalpindi Saddar (Metro Station)
                  </option>
                  <option value="I-8 Markaz (Shell / Habibi), Islamabad">
                    I-8 Markaz (Shell / Habibi), Islamabad
                  </option>
                </select>
                {errors.pickupPoint && <p className="error-text">{errors.pickupPoint}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyNotes">Special Notes (Optional)</label>
                <textarea
                  id="emergencyNotes"
                  name="emergencyNotes"
                  rows="2"
                  value={form.emergencyNotes}
                  onChange={handleInputChange}
                  placeholder="Dietary requests or allergies..."
                  className="input-text"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={hasUnresolvedIssues}
              >
                Confirm Booking (Simulated)
              </button>

              {hasUnresolvedIssues && (
                <p className="warning-note">Please resolve the trip conflicts above before continuing.</p>
              )}
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
