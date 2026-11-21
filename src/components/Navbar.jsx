import { NavLink, Link } from 'react-router-dom';
import { FiCompass, FiBookmark } from 'react-icons/fi';
import { usePlan } from '../context/PlanContext.jsx';

export default function Navbar() {
  const { items } = usePlan();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Karakoram Travels and Tours Home">
            <span className="brand-logo-wrap" aria-hidden="true">
              <FiCompass className="brand-icon" />
            </span>
            <div className="brand-titles">
              <span className="brand-title">Karakoram Travels & Tours</span>
              <span className="brand-subtitle">Guided Outdoor Trips & Treks</span>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Main Navigation">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Explore Trips
            </NavLink>
            <NavLink 
              to="/plan" 
              className={({ isActive }) => `nav-link nav-btn-bookings ${isActive ? 'active' : ''}`}
            >
              <FiBookmark className="nav-icon" />
              <span>My Bookings</span>
              {items.length > 0 && (
                <span className="plan-badge" aria-label={`${items.length} trips in plan`}>
                  {items.length}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </header>
    </>
  );
}
