import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="status-box" role="region" aria-label="Page not found">
      <h2>404 - Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/" className="btn btn-primary">
        <FiArrowLeft /> Back to trips
      </Link>
    </div>
  );
}
