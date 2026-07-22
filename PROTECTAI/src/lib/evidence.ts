export type EvidenceKind = 'incident' | 'near_miss' | 'procedure' | 'regulatory' | 'sensor';

export interface EvidenceRecord {
  id: string;
  kind: EvidenceKind;
  title: string;
  source: string;
  zone?: string;
  excerpt: string;
  tags: string[];
}

/**
 * Small, curated evidence corpus for the simulation MVP. It is intentionally
 * transparent: every generated answer can point back to one of these records.
 * The retrieval function can later be replaced with pgvector or another RAG
 * implementation without changing the Copilot contract.
 */
export const evidenceCorpus: EvidenceRecord[] = [
  {
    id: 'NM-2026-011',
    kind: 'near_miss',
    title: 'Incomplete gas test before welding',
    source: 'Near-miss register · 17 Jul 2026',
    zone: 'Reactor Bay A',
    excerpt: 'A second gas test was required after the hot-work boundary changed. Work was paused before ignition.',
    tags: ['hot work', 'welding', 'gas test', 'permit', 'reactor bay a', 'maintenance'],
  },
  {
    id: 'NM-2026-009',
    kind: 'near_miss',
    title: 'Hydrocarbon odour near transfer line',
    source: 'Near-miss register · 13 Jul 2026',
    zone: 'Reactor Bay A',
    excerpt: 'Odour was detected during line isolation; no ignition source was present and the area was checked.',
    tags: ['gas', 'hydrocarbon', 'transfer line', 'reactor bay a', 'isolation'],
  },
  {
    id: 'INC-2025-118',
    kind: 'incident',
    title: 'Permit boundary changed during maintenance',
    source: 'Incident register · 19 May 2026',
    zone: 'Reactor Bay A',
    excerpt: 'Maintenance work moved closer to process equipment without a recorded second gas test.',
    tags: ['permit', 'boundary', 'maintenance', 'gas test', 'reactor bay a'],
  },
  {
    id: 'PROC-PTW-004',
    kind: 'procedure',
    title: 'Hot-work permit control',
    source: 'Protect AI demo safety procedure',
    zone: 'All process zones',
    excerpt: 'Hot work requires a valid permit, an initial gas test and a repeat test when conditions, boundaries or nearby operations change.',
    tags: ['hot work', 'permit', 'gas test', 'conditions change', 'procedure'],
  },
  {
    id: 'REG-OISD-PTW',
    kind: 'regulatory',
    title: 'Permit-to-work evidence guidance',
    source: 'OISD-aligned demo guidance corpus',
    zone: 'All process zones',
    excerpt: 'Permit controls should preserve the activity, location, approval, test result and corrective action evidence for review.',
    tags: ['oisd', 'permit', 'evidence', 'approval', 'corrective action'],
  },
  {
    id: 'REG-FACTORY-ER',
    kind: 'regulatory',
    title: 'Emergency response readiness',
    source: 'Factory Act-aligned demo guidance corpus',
    zone: 'All zones',
    excerpt: 'Emergency arrangements should identify responsible persons, communication methods, worker accounting and response actions.',
    tags: ['factory act', 'emergency', 'response', 'headcount', 'communication'],
  },
  {
    id: 'REG-DGMS-INSPECT',
    kind: 'regulatory',
    title: 'Inspection and equipment records',
    source: 'DGMS-aligned demo guidance corpus',
    zone: 'Equipment areas',
    excerpt: 'Inspection status, responsible owner and corrective action evidence should remain traceable for safety-critical equipment.',
    tags: ['dgms', 'inspection', 'equipment', 'records', 'corrective action'],
  },
  {
    id: 'SENSOR-GAS-ZB-01',
    kind: 'sensor',
    title: 'GAS-ZB-01 rising telemetry',
    source: 'Digital plant simulator · current event',
    zone: 'Reactor Bay A',
    excerpt: 'The simulated gas reading rose from 8 ppm to 32 ppm and then 48 ppm near active permit HW-104.',
    tags: ['gas', 'sensor', 'rising', 'reactor bay a', 'hw-104', 'hot work'],
  },
];

function tokens(text: string) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((token) => token.length > 2));
}

export function searchEvidence(query: string, limit = 5): EvidenceRecord[] {
  const queryTokens = tokens(query);
  return evidenceCorpus
    .map((record) => {
      const haystack = tokens(`${record.title} ${record.source} ${record.zone || ''} ${record.excerpt} ${record.tags.join(' ')}`);
      const overlap = [...queryTokens].filter((token) => haystack.has(token)).length;
      const tagBoost = [...queryTokens].filter((token) => record.tags.includes(token)).length;
      return { record, score: overlap + tagBoost * 0.75 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id))
    .slice(0, limit)
    .map((item) => item.record);
}
