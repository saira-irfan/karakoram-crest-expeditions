import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiRefreshCw, FiX } from 'react-icons/fi';
import { usePlan } from '../context/PlanContext.jsx';
import TripCard from '../components/TripCard.jsx';

export default function Trips() {
  const { trips, status, errorMessage, load, items } = usePlan();
  const [params, setParams] = useSearchParams();

  // Decision 1: Filter, search, and sort parameters are synced with URL search params
  const q = params.get('q') || '';
  const diff = params.get('diff') || 'all';
  const dur = params.get('dur') || 'all';
  const budget = params.get('budget') || 'all';
  const sort = params.get('sort') || 'date';

  const updateParam = (key, value) => {
    setParams(prev => {
      const updated = new URLSearchParams(prev);
      if (value && value !== 'all' && value.trim() !== '') {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
      return updated;
    }, { replace: true });
  };

  const clearAllFilters = () => {
    setParams({}, { replace: true });
  };

  // Asynchronous Loading State (FR14)
  if (status === 'loading') {
    return (
      <div className="status-box" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <h2>Loading trips...</h2>
        <p>Fetching upcoming weekend departures.</p>
      </div>
    );
  }

  // Loading Failure State with Retry button (FR14)
  if (status === 'error') {
    return (
      <div className="status-box error-box" role="alert">
        <FiAlertTriangle className="status-icon text-danger" aria-hidden="true" />
        <h2>Could not load trips</h2>
        <p>{errorMessage || 'A network error occurred while loading trips.'}</p>
        <p className="hint">If you enabled loading failure in the demo controls below, untick it and click Retry.</p>
        <button type="button" className="btn btn-primary" onClick={load}>
          <FiRefreshCw /> Retry Loading
        </button>
      </div>
    );
  }

  // Pure Empty Dataset (FR15)
  if (!trips || trips.length === 0) {
    return (
      <div className="status-box">
        <h2>No trips scheduled</h2>
        <p>There are no trips currently available in the schedule.</p>
      </div>
    );
  }

  // Filter and Sort Pipeline (FR04, FR05)
  const filteredTrips = trips
    .filter(t => {
      if (!q.trim()) return true;
      const term = q.toLowerCase();
      const searchable = `${t.title} ${t.region} ${t.difficulty} ${t.description} ${t.pickup}`.toLowerCase();
      return searchable.includes(term);
    })
    .filter(t => (diff === 'all' ? true : t.difficulty.toLowerCase() === diff.toLowerCase()))
    .filter(t => {
      if (dur === 'all') return true;
      if (dur === '1') return t.days === 1;
      if (dur === 'multi') return t.days >= 2;
      return true;
    })
    .filter(t => {
      if (budget === 'all') return true;
      return t.price <= Number(budget);
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'days') return a.days - b.days;
      if (sort === 'rating') return b.rating - a.rating;
      return a.departure.localeCompare(b.departure);
    });

  const hasActiveFilters = q.trim() !== '' || diff !== 'all' || dur !== 'all' || budget !== 'all' || sort !== 'date';

  return (
    <div className="trips-page">
      <div className="page-intro">
        <h1>Weekend Trips & Treks</h1>
        <p className="intro-text">
          Explore guided mountain hikes and outdoor tours across Northern Pakistan.
          Bookings of 5 or more travellers receive an automatic 10% group discount.
        </p>
      </div>

      {/* Filter and Search Bar (FR04, FR05, Decision 1) */}
      <section className="filter-bar" aria-label="Search and filter trips">
        <div className="search-wrap">
          <FiSearch className="search-icon" aria-hidden="true" />
          <input
            id="search-input"
            type="search"
            value={q}
            onChange={e => updateParam('q', e.target.value)}
            placeholder="Search by destination (e.g. Murree, Nathia Gali, Swat)..."
            className="input-text search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-item">
            <label htmlFor="diff-select">Difficulty</label>
            <select
              id="diff-select"
              value={diff}
              onChange={e => updateParam('diff', e.target.value)}
              className="input-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="dur-select">Duration</label>
            <select
              id="dur-select"
              value={dur}
              onChange={e => updateParam('dur', e.target.value)}
              className="input-select"
            >
              <option value="all">Any Duration</option>
              <option value="1">1 Day</option>
              <option value="multi">2+ Days</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="budget-select">Max Budget</label>
            <select
              id="budget-select"
              value={budget}
              onChange={e => updateParam('budget', e.target.value)}
              className="input-select"
            >
              <option value="all">Any Price</option>
              <option value="5000">Up to Rs 5,000</option>
              <option value="20000">Up to Rs 20,000</option>
              <option value="35000">Up to Rs 35,000</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="input-select"
            >
              <option value="date">Departure date</option>
              <option value="price-asc">Price (low to high)</option>
              <option value="price-desc">Price (high to low)</option>
              <option value="rating">Highest rated</option>
              <option value="days">Duration</option>
            </select>
          </div>
        </div>

        <div className="filter-summary">
          <span className="results-label">
            Showing <strong>{filteredTrips.length}</strong> of <strong>{trips.length}</strong> trips
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-link"
              onClick={clearAllFilters}
            >
              <FiX /> Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Grid or Empty Results (FR15) */}
      {filteredTrips.length === 0 ? (
        <div className="empty-results-box" role="region" aria-label="No matching trips">
          <h3>No trips match your filters</h3>
          <p>Try searching for a different destination or clearing the active filters.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearAllFilters}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <ul className="trips-grid">
          {filteredTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              inPlanItem={items.find(item => item.id === trip.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
