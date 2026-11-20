import { TRIPS_DATA } from '../data/trips.js';

/**
 * Asynchronous Mock Loader
 * Simulates real-world API / database latency and provides controlled failure simulation
 * for assessing UI resilience, loading skeletons/spinners, error banners, and retry operations.
 *
 * @param {boolean} shouldFail - When enabled via demo controls, forces an asynchronous rejection.
 * @param {number} delayMs - Simulated network latency in milliseconds.
 * @returns {Promise<Array>} Resolved list of expedition objects or rejected error.
 */
export function loadTrips(shouldFail = false, delayMs = 600) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network error: Failed to connect to expedition database. Please check connection and retry.'));
      } else {
        // Return deep copy so mutation cannot corrupt underlying static dataset
        resolve(JSON.parse(JSON.stringify(TRIPS_DATA)));
      }
    }, delayMs);
  });
}
