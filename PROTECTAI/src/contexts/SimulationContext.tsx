/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';
import { simulationStages, type SimulationStage } from '../lib/simulation';

export interface SimulationEvent {
  id: string;
  stage: SimulationStage;
  title: string;
  detail: string;
  severity: 'info' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface SimulationContextValue {
  stage: SimulationStage;
  stageIndex: number;
  events: SimulationEvent[];
  setStage: (stage: SimulationStage) => void;
  advance: () => void;
  reset: () => void;
  clearEvents: () => void;
}

const STAGE_KEY = 'protectai.simulation.stage';
const EVENTS_KEY = 'protectai.simulation.events';
const stageEvent: Record<SimulationStage, Omit<SimulationEvent, 'id' | 'stage' | 'timestamp'>> = {
  baseline: { title: 'Simulation reset', detail: 'Plant returned to a stable baseline with no active permit conflict.', severity: 'info' },
  permit: { title: 'Permit HW-104 activated', detail: 'Hot-work context added to Reactor Bay A risk assessment.', severity: 'medium' },
  rising: { title: 'Gas trend detected', detail: 'GAS-ZB-01 rose from 8 ppm to 32 ppm within the permit radius.', severity: 'high' },
  critical: { title: 'Compound risk crossed critical threshold', detail: 'The system recommends pausing hot work and notifying the control room.', severity: 'critical' },
  response: { title: 'Emergency response confirmed', detail: 'Response actions and evidence preservation workflow are active.', severity: 'critical' },
};

const initialEvent = (): SimulationEvent => ({ id: `evt-${Date.now()}`, stage: 'baseline', ...stageEvent.baseline, timestamp: new Date().toISOString() });

function readInitialStage(): SimulationStage {
  try {
    const stored = localStorage.getItem(STAGE_KEY);
    if (stored && simulationStages.includes(stored as SimulationStage)) return stored as SimulationStage;
  } catch {
    // Storage is optional in private browsing and test environments.
  }
  return 'baseline';
}

function readInitialEvents(): SimulationEvent[] {
  try {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (stored) {
      const events = JSON.parse(stored) as SimulationEvent[];
      if (Array.isArray(events) && events.length) return events.slice(-20);
    }
  } catch {
    // Start with a clean event stream when storage is unavailable or corrupt.
  }
  return [initialEvent()];
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStageState] = useState<SimulationStage>(readInitialStage);
  const [events, setEvents] = useState<SimulationEvent[]>(readInitialEvents);

  const persistEvents = (next: SimulationEvent[]) => {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
    } catch {
      // Keep the stream in memory when storage is unavailable.
    }
  };

  const setStage = (next: SimulationStage) => {
    setStageState(next);
    const event: SimulationEvent = { id: `evt-${Date.now()}`, stage: next, ...stageEvent[next], timestamp: new Date().toISOString() };
    setEvents((current) => {
      const nextEvents = [...current, event].slice(-20);
      persistEvents(nextEvents);
      return nextEvents;
    });
    try {
      localStorage.setItem(STAGE_KEY, next);
    } catch {
      // Keep the simulation usable when storage is unavailable.
    }
  };

  const advance = () => {
    const index = simulationStages.indexOf(stage);
    setStage(simulationStages[Math.min(index + 1, simulationStages.length - 1)]);
  };

  const reset = () => {
    setStageState('baseline');
    const event = initialEvent();
    setEvents([event]);
    persistEvents([event]);
    try {
      localStorage.setItem(STAGE_KEY, 'baseline');
    } catch {
      // Storage is optional.
    }
  };

  const clearEvents = () => {
    setEvents([]);
    persistEvents([]);
  };

  return (
    <SimulationContext.Provider value={{ stage, stageIndex: simulationStages.indexOf(stage), events, setStage, advance, reset, clearEvents }}>
      {children}
    </SimulationContext.Provider>
  );
}
