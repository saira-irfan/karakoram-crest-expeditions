import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loadTrips } from '../utils/mockLoader.js';

export const DEFAULT_DEMO_NOW = '2026-11-13T09:00';
const STORAGE_KEY = 'karakoram-crest-plan-v1';

const PlanContext = createContext(null);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export function PlanProvider({ children }) {
  const [rawTrips, setRawTrips] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Edge-case demo controls
  const [failLoad, setFailLoad] = useState(false);
  const [soldOutDemo, setSoldOutDemo] = useState(false);
  const [now, setNow] = useState(DEFAULT_DEMO_NOW);
  const [attempt, setAttempt] = useState(0);

  // Persistent selection cart in localStorage (FR13)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not read saved plan from localStorage:', e);
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not persist plan to localStorage:', e);
    }
  }, [items]);

  // Async data loader (FR14) with cancellation cleanup to prevent memory leaks / stale state
  const load = useCallback(() => {
    setAttempt(a => a + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setStatus('loading');
    setErrorMessage('');

    loadTrips(failLoad)
      .then(data => {
        if (!isCancelled) {
          setRawTrips(data);
          setStatus('ready');
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to load expeditions.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [failLoad, attempt]);

  // Live simulation modification: when soldOutDemo is ticked, trip 't3' (Nathia Gali) drops to 0 seats.
  const trips = useMemo(() => {
    return rawTrips.map(trip => {
      if (soldOutDemo && trip.id === 't3') {
        return { ...trip, seats: 0 };
      }
      return trip;
    });
  }, [rawTrips, soldOutDemo]);

  // Plan modification actions (FR07)
  const addTrip = (id, travellers) => {
    setItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], travellers };
        return next;
      }
      return [...prev, { id, travellers }];
    });
  };

  const setQty = (id, travellers) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, travellers } : item)));
  };

  const removeTrip = id => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearPlan = () => {
    setItems([]);
  };

  const resetDemo = () => {
    setFailLoad(false);
    setSoldOutDemo(false);
    setNow(DEFAULT_DEMO_NOW);
  };

  const totalTravellers = items.reduce((acc, item) => acc + (item.travellers || 0), 0);

  const value = {
    trips,
    status,
    errorMessage,
    load,
    items,
    totalTravellers,
    addTrip,
    setQty,
    removeTrip,
    clearPlan,
    failLoad,
    setFailLoad,
    soldOutDemo,
    setSoldOutDemo,
    now,
    setNow,
    resetDemo
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
