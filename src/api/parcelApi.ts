const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface UploadResponse {
  job_id: string;
  filename: string;
  size_bytes: number;
  status: string;
}

export interface ProcessingStatus {
  job_id: string;
  status: 'processing' | 'done' | 'error';
  step: number;
  total_steps: number;
  parcels_detected: number;
  discrepancies: number;
}

export interface ParcelFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    id: string;
    name: string;
    area_sqm: number;
    perimeter_m: number;
    confidence: number;
    land_use: string;
    status: 'verified' | 'flagged' | 'pending';
    discrepancy_flag: boolean;
    discrepancy_description?: string;
    shift_distance_m?: number;
  };
}

export interface ParcelFeatureCollection {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

/**
 * Upload a drone imagery file to the backend for parcel extraction.
 */
export async function uploadImagery(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Poll the processing status for a job until it is done.
 * Calls onStep each time the status updates.
 */
export async function pollStatus(
  jobId: string,
  onStep: (status: ProcessingStatus) => void,
  intervalMs = 800,
): Promise<ProcessingStatus> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/status/${jobId}`);
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        const status: ProcessingStatus = await res.json();
        onStep(status);
        if (status.status === 'done' || status.status === 'error') {
          resolve(status);
        } else {
          setTimeout(poll, intervalMs);
        }
      } catch (err) {
        reject(err);
      }
    };
    poll();
  });
}

/**
 * Fetch all extracted parcels as a GeoJSON FeatureCollection.
 * Pass job_id to get results specific to that upload.
 */
export async function fetchParcels(jobId?: string): Promise<ParcelFeatureCollection> {
  const url = jobId
    ? `${BASE_URL}/api/parcels?job_id=${encodeURIComponent(jobId)}`
    : `${BASE_URL}/api/parcels`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch parcels: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Convert a ParcelFeatureCollection to the Parcel[] format used by components.
 */
export function featureCollectionToParcels(fc: ParcelFeatureCollection) {
  return fc.features.map((f) => ({
    id: f.properties.id,
    name: f.properties.name,
    geometry: f.geometry,
    properties: {
      area_sqm: f.properties.area_sqm,
      perimeter_m: f.properties.perimeter_m,
      confidence: f.properties.confidence,
      land_use: f.properties.land_use,
      status: f.properties.status,
      discrepancy_flag: f.properties.discrepancy_flag,
      discrepancy_description: f.properties.discrepancy_description,
      shift_distance_m: f.properties.shift_distance_m,
    },
    activity: [
      {
        action: 'Boundary auto-detected via AI segmentation',
        timestamp: new Date().toISOString(),
        type: 'detection' as const,
      },
    ],
  }));
}
