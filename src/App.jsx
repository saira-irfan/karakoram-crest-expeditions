import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Trips from './pages/Trips.jsx';
import TripDetails from './pages/TripDetails.jsx';
import Plan from './pages/Plan.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main id="main" className="app-main">
        <Routes>
          <Route path="/" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
