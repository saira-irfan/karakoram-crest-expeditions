import { usePlan } from '../context/PlanContext.jsx';

export default function Footer() {
  const {
    failLoad,
    setFailLoad,
    soldOutDemo,
    setSoldOutDemo,
    now,
    setNow,
    resetDemo
  } = usePlan();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <h3 className="footer-logo">Karakoram Crest Treks</h3>
            <p className="footer-tagline">
              Guided hiking trips and tours across Northern Pakistan.
            </p>
          </div>
        </div>

        <details className="demo-box">
          <summary>Demo controls (for evaluation & testing)</summary>
          <div className="demo-body">
            <label className="demo-check">
              <input
                type="checkbox"
                checked={failLoad}
                onChange={e => setFailLoad(e.target.checked)}
              />
              <span>Simulate loading failure (tests error state & Retry button)</span>
            </label>

            <label className="demo-check">
              <input
                type="checkbox"
                checked={soldOutDemo}
                onChange={e => setSoldOutDemo(e.target.checked)}
              />
              <span>Sell out Nathia Gali trip (tests cart conflict handling)</span>
            </label>

            <label className="demo-clock-row">
              <span>Demo reference time:</span>
              <input
                type="datetime-local"
                value={now}
                onChange={e => setNow(e.target.value)}
                className="input-datetime"
              />
              <small>(Used to test the 72-hour departure cutoff policy)</small>
            </label>

            <div className="demo-btn-row">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={resetDemo}
              >
                Reset demo controls
              </button>
            </div>
          </div>
        </details>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Karakoram Crest Treks. All bookings are simulated for demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
