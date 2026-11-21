import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { checkDeadline } from '../utils/rules.js';
import { usePlan } from '../context/PlanContext.jsx';
import ImageWithFallback from './ImageWithFallback.jsx';

export default function TripCard({ trip, inPlanItem }) {
  const { now } = usePlan();
  const deadlineCheck = checkDeadline(trip.departure, now);
  const isOpen = deadlineCheck.ok;
  const isSoldOut = trip.seats <= 0;

  // Status label & class
  let statusText = `${trip.seats} seats available`;
  let statusClass = 'status-available';

  if (isSoldOut) {
    statusText = 'Sold Out';
    statusClass = 'status-closed';
  } else if (!isOpen) {
    statusText = 'Booking Closed (72h cutoff)';
    statusClass = 'status-closed';
  } else if (trip.seats <= 4) {
    statusText = `Only ${trip.seats} seats left`;
    statusClass = 'status-warning';
  }

  const departureDate = new Date(trip.departure).toLocaleDateString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <li className="trip-card">
      <Link to={`/trips/${trip.id}`} className="card-thumb-link" tabIndex="-1" aria-hidden="true">
        <div className="card-thumb">
          <ImageWithFallback
            src={trip.image}
            alt={trip.title}
            className="thumb-img"
            fallbackText={trip.region}
          />
        </div>
      </Link>

      <div className="card-content">
        <div className="card-meta">
          <span className={`pill-diff pill-${trip.difficulty.toLowerCase()}`}>
            {trip.difficulty}
          </span>
          <span className="card-region">{trip.region}</span>
          <span className="dot">•</span>
          <span className="card-days">{trip.days} {trip.days === 1 ? 'day' : 'days'}</span>
        </div>

        <h3 className="card-title">
          <Link to={`/trips/${trip.id}`}>{trip.title}</Link>
        </h3>

        {/* Upfront Conditions (FR06 & Decision 2) */}
        <div className="card-details-row">
          <span>Min Age: <strong>{trip.minAge}+</strong></span>
          <span className="dot">•</span>
          <span>Departs: <strong>{departureDate}</strong></span>
        </div>

        <div className="card-availability">
          <span className={`status-pill ${statusClass}`}>
            {statusText}
          </span>
          {inPlanItem && (
            <span className="in-plan-pill">
              <FiCheck /> In your plan ({inPlanItem.travellers})
            </span>
          )}
        </div>

        <p className="card-description">
          {trip.description}
        </p>

        <div className="card-bottom">
          <div className="price-tag">
            <span className="price-num">Rs {trip.price.toLocaleString()}</span>
            <span className="price-sub">per person</span>
          </div>
          <Link to={`/trips/${trip.id}`} className="btn btn-outline">
            <span>View Details</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </li>
  );
}
