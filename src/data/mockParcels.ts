export interface ParcelActivity {
  action: string;
  timestamp: string;
  type: 'detection' | 'comparison' | 'flag' | 'verification';
}

export interface Parcel {
  id: string;
  name: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    area_sqm: number;
    perimeter_m: number;
    confidence: number;
    land_use: string;
    status: 'verified' | 'flagged' | 'pending';
    discrepancy_flag: boolean;
    discrepancy_description?: string;
    shift_distance_m?: number;
    owner_name?: string;
  };
  activity: ParcelActivity[];
}

// Mock parcels centered around a real-world location (Lucknow, UP, India — relevant for SVAMITVA)
export const mockParcels: Parcel[] = [
  {
    id: 'UP-0472',
    name: 'Plot 47/2 — Residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9462, 26.8467],
        [80.9472, 26.8467],
        [80.9472, 26.8477],
        [80.9462, 26.8477],
        [80.9462, 26.8467],
      ]],
    },
    properties: {
      area_sqm: 212.4,
      perimeter_m: 58.6,
      confidence: 0.94,
      land_use: 'Residential',
      status: 'verified',
      discrepancy_flag: false,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:00Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:45Z', type: 'comparison' },
      { action: 'Verified — no discrepancy found', timestamp: '2026-08-30T14:23:10Z', type: 'verification' },
    ],
  },
  {
    id: 'UP-0473',
    name: 'Plot 47/3 — Agricultural',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9475, 26.8467],
        [80.9490, 26.8467],
        [80.9490, 26.8480],
        [80.9475, 26.8480],
        [80.9475, 26.8467],
      ]],
    },
    properties: {
      area_sqm: 487.2,
      perimeter_m: 89.4,
      confidence: 0.91,
      land_use: 'Agricultural',
      status: 'flagged',
      discrepancy_flag: true,
      discrepancy_description: 'Boundary shifted 1.2m from existing record',
      shift_distance_m: 1.2,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:00Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:45Z', type: 'comparison' },
      { action: 'Flagged — boundary shift detected (1.2m)', timestamp: '2026-08-30T14:23:15Z', type: 'flag' },
    ],
  },
  {
    id: 'UP-0474',
    name: 'Plot 47/4 — Commercial',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9450, 26.8480],
        [80.9465, 26.8480],
        [80.9465, 26.8492],
        [80.9450, 26.8492],
        [80.9450, 26.8480],
      ]],
    },
    properties: {
      area_sqm: 324.8,
      perimeter_m: 72.1,
      confidence: 0.97,
      land_use: 'Commercial',
      status: 'verified',
      discrepancy_flag: false,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:00Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:48Z', type: 'comparison' },
      { action: 'Verified — no discrepancy found', timestamp: '2026-08-30T14:23:08Z', type: 'verification' },
    ],
  },
  {
    id: 'UP-0475',
    name: 'Plot 47/5 — Residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9468, 26.8492],
        [80.9480, 26.8492],
        [80.9480, 26.8502],
        [80.9468, 26.8502],
        [80.9468, 26.8492],
      ]],
    },
    properties: {
      area_sqm: 178.5,
      perimeter_m: 53.8,
      confidence: 0.88,
      land_use: 'Residential',
      status: 'flagged',
      discrepancy_flag: true,
      discrepancy_description: 'Encroachment detected on eastern boundary',
      shift_distance_m: 0.8,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:00Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:50Z', type: 'comparison' },
      { action: 'Flagged — encroachment detected (0.8m)', timestamp: '2026-08-30T14:23:20Z', type: 'flag' },
    ],
  },
  {
    id: 'UP-0476',
    name: 'Plot 47/6 — Government',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9440, 26.8495],
        [80.9458, 26.8495],
        [80.9458, 26.8510],
        [80.9440, 26.8510],
        [80.9440, 26.8495],
      ]],
    },
    properties: {
      area_sqm: 562.0,
      perimeter_m: 96.2,
      confidence: 0.96,
      land_use: 'Government',
      status: 'verified',
      discrepancy_flag: false,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:02Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:52Z', type: 'comparison' },
      { action: 'Verified — no discrepancy found', timestamp: '2026-08-30T14:23:05Z', type: 'verification' },
    ],
  },
  {
    id: 'UP-0477',
    name: 'Plot 47/7 — Mixed Use',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9483, 26.8480],
        [80.9498, 26.8480],
        [80.9498, 26.8495],
        [80.9483, 26.8495],
        [80.9483, 26.8480],
      ]],
    },
    properties: {
      area_sqm: 401.3,
      perimeter_m: 81.6,
      confidence: 0.85,
      land_use: 'Mixed Use',
      status: 'flagged',
      discrepancy_flag: true,
      discrepancy_description: 'Multiple boundary deviations detected',
      shift_distance_m: 2.1,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:01Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:55Z', type: 'comparison' },
      { action: 'Flagged — multiple deviations (2.1m max)', timestamp: '2026-08-30T14:23:25Z', type: 'flag' },
    ],
  },
  {
    id: 'UP-0478',
    name: 'Plot 47/8 — Agricultural',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9445, 26.8460],
        [80.9460, 26.8460],
        [80.9460, 26.8472],
        [80.9445, 26.8472],
        [80.9445, 26.8460],
      ]],
    },
    properties: {
      area_sqm: 298.7,
      perimeter_m: 70.4,
      confidence: 0.92,
      land_use: 'Agricultural',
      status: 'verified',
      discrepancy_flag: false,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:00Z', type: 'detection' },
      { action: 'Compared against existing cadastral record', timestamp: '2026-08-30T14:22:42Z', type: 'comparison' },
      { action: 'Verified — no discrepancy found', timestamp: '2026-08-30T14:23:02Z', type: 'verification' },
    ],
  },
  {
    id: 'UP-0479',
    name: 'Plot 47/9 — Residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [80.9492, 26.8498],
        [80.9505, 26.8498],
        [80.9505, 26.8508],
        [80.9492, 26.8508],
        [80.9492, 26.8498],
      ]],
    },
    properties: {
      area_sqm: 245.1,
      perimeter_m: 63.2,
      confidence: 0.93,
      land_use: 'Residential',
      status: 'pending',
      discrepancy_flag: false,
    },
    activity: [
      { action: 'Boundary auto-detected via AI segmentation', timestamp: '2026-08-30T14:22:03Z', type: 'detection' },
      { action: 'Awaiting comparison against cadastral record', timestamp: '2026-08-30T14:23:00Z', type: 'comparison' },
    ],
  },
];

export const getParcelGeoJSON = () => ({
  type: 'FeatureCollection' as const,
  features: mockParcels.map(parcel => ({
    type: 'Feature' as const,
    id: parcel.id,
    geometry: parcel.geometry,
    properties: {
      id: parcel.id,
      name: parcel.name,
      ...parcel.properties,
    },
  })),
});

export const getFlaggedParcels = () => mockParcels.filter(p => p.properties.discrepancy_flag);
