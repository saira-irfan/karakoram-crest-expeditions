# Karakoram Crest Expeditions — Guided Mountain & Heritage Treks

**Course:** CS4032 Web Programming  
**Assignment:** 02 — Business Website Development Using React  


## 1. Project Title & Student Information
* **Project Name:** Karakoram Crest Expeditions
* **Student Name:** saira irfan
* **Roll Number:** 24i-2125
* **Section:** C

* **GitHub Repository:** https://github.com/saira-irfan/karakoram-crest-expeditions
* **Live Deployment Link:** https://YOUR-PROJECT.vercel.app
* **Final Submission Commit Hash:** 8e8f5a4f7d103a80025788c30ef56397f091a6ee



---

## 2. Project Description
**Karakoram Crest Expeditions** is an ethical adventure tourism platform tailored for university students, faculty, and outdoor enthusiasts across the Islamabad and Rawalpindi twin cities. The website enables users to discover, filter, and plan guided weekend treks and alpine expeditions departing from designated twin cities hubs (F-6 Markaz, Rawalpindi Saddar, and I-8 Markaz).

The platform addresses three core UX deficiencies identified in existing travel portals by introducing URL-synchronized filter preservation, upfront safety/deadline visibility, and a resilient controlled booking form with automated cart conflict revalidation.

---

## 3. Installation, Build & Testing Commands

### Prerequisites
* Node.js v18+ (tested on Node.js v24.11.0)
* npm v9+

### Commands
```bash
# 1. Install all dependencies
npm install

# 2. Start the local Vite development server (hot reload on http://localhost:3000)
npm run dev

# 3. Build optimized production bundle to /dist
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Run automated business-rule tests using Node.js built-in test runner
npm test
# (Equivalent to: node --test tests/rules.test.js)
```

---

## 4. Main Routes & Features Summary

| Route | Component | Purpose & Features |
|---|---|---|
| `/` | `src/pages/Trips.jsx` | **Expeditions Catalogue:** Hero banner, text search, multi-criteria filters (difficulty, duration, budget), sorting dropdown, results counter, empty states, and trip cards with upfront conditions. |
| `/trips/:id` | `src/pages/TripDetails.jsx` | **Expedition Details View:** Parameterized route displaying comprehensive trip overview, elevation, day-by-day itinerary, included equipment, interactive group size stepper, live price calculator with group discount preview, and "Add to Plan" action. Handles invalid IDs with friendly recovery guidance. |
| `/plan` | `src/pages/Plan.jsx` | **Expedition Plan & Checkout:** Selection management (adjust traveller count, remove items, clear plan), automated re-validation against current stock/deadlines, financial summary (gross fare, 10% group discount for 5+ people, 30% advance deposit), and controlled lead traveller booking form with instant validation feedback. |
| `/confirmation` | `src/pages/Confirmation.jsx` | **Simulated Booking Outcome:** Official booking reference code, itinerary overview, departure logistics, printable booking voucher action, and clear educational simulation disclosure. |
| `*` | `src/pages/NotFound.jsx` | **404 Recovery:** Graceful fallback for undefined URLs with direct link back to catalogue. |

---

## 5. Three Core Business Rules

1. **Rule 1: Capacity & Availability Limit (Numerical Limit)**
   * *Condition:* Group bookings accept between 1 and 10 travellers (`MAX_GROUP = 10`), strictly bounded by remaining seats (`seatsLeft`).
   * *Where communicated:* Displayed on every trip card, on `TripDetails` beside the stepper, and in the plan summary.
   * *Enforcement:* Quantities exceeding 10 or remaining seats disable submission and trigger specific inline warnings.
   * *Boundary Case:* Group of 10 travellers is accepted; group of 11 travellers is rejected.

2. **Rule 2: Eligibility & Participant Suitability**
   * *Condition:* The youngest participant's age must meet or exceed the expedition's `minAge` requirement (e.g. 16+ for strenuous alpine treks like Fairy Meadows and Rakaposhi; 12+ for moderate trails; 6+ for family walks).
   * *Where communicated:* Prominently tagged on cards (`Age 16+`) and detailed in the safety specifications.
   * *Enforcement:* Entering an age below any booked trip's requirement flags the field in red and prevents booking confirmation while preserving valid input.
   * *Boundary Case:* Age 16 on a 16+ trek is accepted; age 15 is rejected.

3. **Rule 3: Booking Cutoff & Fulfilment Deadline**
   * *Condition:* Expeditions require at least 72 hours advance reservation (`DEADLINE_HOURS = 72`) for logistical coordination.
   * *Where communicated:* Card status badge shows `Booking Closed (72h cutoff)` if past cutoff; details page displays exact remaining hours.
   * *Enforcement:* Closes booking, disables button, and flags restored cart items if the cutoff timestamp has elapsed.
   * *Boundary Case:* Exactly 72.0 hours prior to departure is open; 71.9 hours closes booking.

* **Additional Pricing Rule:** Parties of 5 or more travellers automatically receive a 10% group discount on total fare. 30% advance deposit is calculated.

---

## 6. Edge Cases & How to Reproduce Them

The application includes an **Interactive QA Inspector Panel** pinned in the footer for viva demonstrations:

1. **Loading Failure & Retry (FR14):**
   * Open the footer *Demo Controls* panel.
   * Check the box labeled **"Simulate Data Load Failure"**.
   * Navigate to `/` or press page refresh.
   * *Observed Result:* A clear error banner appears stating network failure with a working **"🔄 Retry Loading"** button. Untick the box and click Retry to restore data.

2. **Trip Sells Out While in Saved Cart (Task 6.1):**
   * Add *Nathia Gali & Miranjani Ridge Trek* (`t3`) to your plan and go to `/plan`.
   * In the footer QA panel, check **"Sell Out Nathia Gali Trek (t3)"**.
   * Refresh the `/plan` page.
   * *Observed Result:* The application re-validates the saved item, marks the card in red with `Conflict: This expedition is currently sold out`, and disables checkout until the item is adjusted or removed.

3. **72-Hour Cutoff Demonstration (Rule 3 Boundary):**
   * Inspect *Khanpur Lake Day* (departs `2026-11-16T08:00`).
   * In the footer demo clock, adjust the date to `2026-11-14T09:00` (< 72h before departure).
   * *Observed Result:* The status updates live to `Booking Closed (72h cutoff)`, and booking buttons are disabled.

4. **Empty Search & Filter Results (FR15):**
   * On `/`, search for a term with no matches (e.g. `"Sahara"`).
   * *Observed Result:* Displays a distinct "No Matching Expeditions Found" card with a 1-click **"Reset Filters & Show All Expeditions"** button (distinct from an empty database).

5. **Invalid Route & Unknown Trip ID (FR02):**
   * Navigate directly to `/trips/invalid-id-999` or `/random-page`.
   * *Observed Result:* Displays helpful recovery screens explaining the missing resource with a return button.

---

## 7. Concept Map

| Concept | File Location | Key Component / Hook / Function |
|---|---|---|
| Routing & Parameterized Routes | `src/App.jsx`, `src/pages/TripDetails.jsx` | `<Routes>`, `<Route path="/trips/:id">`, `useParams()`, `useNavigate()` |
| URL Search Params Synchronization | `src/pages/Trips.jsx` | `useSearchParams()`, `updateParam()`, `clearAllFilters()` |
| Global State Management | `src/context/PlanContext.jsx` | `PlanContext`, `PlanProvider`, `usePlan()`, `useState()`, `useMemo()` |
| Asynchronous Mock Loading & Retry | `src/utils/mockLoader.js`, `PlanContext.jsx` | `loadTrips()`, `Promise`, `setTimeout()`, `useEffect()`, cleanup return |
| LocalStorage Persistence | `src/context/PlanContext.jsx` | `localStorage.getItem()`, `localStorage.setItem()` inside `useEffect` |
| Immutable State Updates | `src/context/PlanContext.jsx` | `addTrip`, `setQty`, `removeTrip` using spread `[...]` and `.map()/.filter()` |
| Pure Business Rules & Node Tests | `src/utils/rules.js`, `tests/rules.test.js` | `checkGroupSize`, `checkAge`, `checkDeadline`, `summarize`, `node:test` |
| Controlled Forms & Per-Field Validation | `src/pages/Plan.jsx` | `form` state, `handleInputChange`, `handleSubmit`, `errors` state |
| Image Error Fallback Resilience | `src/components/ImageWithFallback.jsx` | `onError` handler, fallback mountain SVG placeholder |
| Authored Responsive CSS | `src/styles/app.css` | Custom CSS variables, media queries (`@media (max-width: 600px)`), Flexbox, CSS Grid |

---

## 8. Simulated Operations & Known Limitations
* **Simulated Transactions:** All bookings, reservation codes, and discount calculations are strictly simulated on the client side. No real payment gateways or external banking APIs are connected.
* **Excluded Credentials:** In accordance with course guidelines and ethics, user passwords, credentials, and sensitive credit card numbers are strictly omitted.
* **Mock Data:** The 12 expeditions are powered by an in-memory dataset loaded via an asynchronous Promise mock loader.
