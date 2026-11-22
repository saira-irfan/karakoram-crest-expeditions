# Frontend Decisions — Karakoram Crest Expeditions
**Course:** CS4032 Web Programming • Assignment 02  
**Business Domain:** Travel, Guided Treks & Outdoor Experiences  
**Operating Area:** Islamabad & Rawalpindi Twin Cities Departure Hubs  

---

## Decision 1: Filter & Search State Preserved via URL Query Parameters
* **Focus Area:** Interaction & State Behaviour
* **Problem Addressed:** On reference travel platforms (e.g., local tour portals), when customers narrow down trips by difficulty or budget, open a trip details page, and click the browser's Back button, all applied search keywords and filters reset to default. Users lose their discovery progress and must re-enter search terms repeatedly.
* **Decision Chosen:** Persist all active filters (search query `q`, difficulty `diff`, duration `dur`, budget `budget`, and sorting `sort`) directly in the URL using React Router's `useSearchParams` hook with `{ replace: true }`.
* **Alternative Considered:** Keep active search and filter criteria in local React component state or global Context memory.
* **Reasoning:** Storing filter state in the URL ensures that the browser's native Back/Forward buttons and page refreshes maintain exact search results. It also enables students and expedition groups to copy and share direct links to filtered expedition lists.
* **Tradeoff:** Increases code complexity for synchronizing controlled form controls with URL state, requires defensive string-to-number parsing, and requires explicit clearing logic for empty parameters.
* **Code Location:** `src/pages/Trips.jsx` (`updateParam`, `clearAllFilters`, and filter pipeline).
* **Evidence & Verification Steps:**
  1. Navigate to `/` and type `"Nathia"` in the search bar or select `Moderate` difficulty.
  2. Notice the URL updates to `/?q=Nathia` or `/?diff=moderate`.
  3. Click on the expedition card to navigate to `/trips/t3`.
  4. Click the browser Back button or the "← Back to Expeditions" link.
  5. The search query and filters are immediately restored with the same filtered results displayed.

---

## Decision 2: Upfront Availability & Safety Eligibility on Listing Cards
* **Focus Area:** Information Hierarchy & Mobile Layout
* **Problem Addressed:** Reference booking sites frequently hide strict eligibility restrictions (such as minimum participant age for high-altitude treks, 72-hour booking cutoffs, and remaining seat counts) until the final checkout or payment screen. Users invest time customizing dates only to discover they are ineligible.
* **Decision Chosen:** Surface critical operational conditions directly on each expedition card:
  1. Explicit availability badges (`X seats available`, amber warning for `<= 4 seats`, crimson `Sold Out` or `Booking Closed`).
  2. Minimum participant age pill (e.g. `Age 16+` for strenuous alpine treks vs `Age 6+` for family walks).
  3. Departure date and elevation tag visible without requiring the user to open the details view.
* **Alternative Considered:** Show only basic titles and prices on cards, reserving all requirements for a secondary "Terms & Conditions" tab on the details page.
* **Reasoning:** In adventure tourism, participant fitness and safety constraints are non-negotiable. Upfront visibility prevents customer frustration, reduces booking abandonment, and streamlines option comparison.
* **Tradeoff:** Cards carry denser information, requiring clean typography, badge wrapping, and responsive padding to prevent visual clutter on narrow 390px mobile viewports.
* **Code Location:** `src/components/TripCard.jsx` and `src/pages/TripDetails.jsx` (specifications grid).
* **Evidence & Verification Steps:**
  1. Open `/` and view the expedition cards.
  2. Observe the clear status badge on each card: Fairy Meadows displays `Age 16+` and remaining seats.
  3. Observe that trips past the 72h cutoff immediately show a red `Booking Closed` badge and disabled actions.

---

## Decision 3: Resilient Controlled Form with Per-Field Errors & Cart Conflict Recovery
* **Focus Area:** Interaction & Form State Behaviour
* **Problem Addressed:** Reference checkout forms frequently clear out valid user inputs when a validation rule fails, forcing repetitive typing. Additionally, saved bookings do not check whether a trip has sold out or passed its cutoff between sessions.
* **Decision Chosen:** Built a fully controlled React form with per-field error feedback that preserves valid input fields upon failed submission. Paired this with an automatic cart re-validation engine that re-evaluates stored `localStorage` reservations against current capacity and deadlines before permitting reservation confirmation.
* **Alternative Considered:** Use uncontrolled inputs with standard HTML5 browser tooltips and a single generic error banner at the top of the page.
* **Reasoning:** Preserving valid inputs respects user effort, while specific per-field error messages (`aria-invalid`, `aria-describedby`) ensure accessibility for keyboard and screen-reader users. Re-validating cart selections guarantees that seat exhaustion or expired deadlines prevent invalid order completion.
* **Tradeoff:** Requires individual state tracking, change handlers, validation regexes, and reactive cart conflict warnings in `Plan.jsx`.
* **Code Location:** `src/pages/Plan.jsx` (`handleInputChange`, `handleSubmit`, `evaluatedLines`).
* **Evidence & Verification Steps:**
  1. Add a trip to plan and go to `/plan`.
  2. Fill in valid name (`Ali Ahmed`) and valid phone (`0300-1234567`), but enter age `14` for a trip requiring 16+.
  3. Click "Confirm Simulated Reservation".
  4. Notice the name and phone remain safely filled in, while the age field displays a red border and specific guidance: `"[Trip] requires all participants to be at least 16 years old"`.
  5. Tick "Sell Out Nathia Gali" in the footer QA inspector and observe the live conflict warning blocking invalid checkout.
