import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SectionLabel } from '../components/ui/SectionLabel';
import { ParcelMap } from '../components/map/ParcelMap';
import { ParcelDetailCard } from '../components/dashboard/ParcelDetailCard';
import { DiscrepancyPanel } from '../components/dashboard/DiscrepancyPanel';
import { fetchParcels, featureCollectionToParcels } from '../api/parcelApi';
import type { Parcel } from '../data/mockParcels';
import { mockParcels } from '../data/mockParcels';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { job_id, filename } = (location.state as { job_id?: string; filename?: string }) || {};

  const [parcels, setParcels] = useState<Parcel[]>(mockParcels);
  const [loading, setLoading] = useState(true);
  const [selectedParcelId, setSelectedParcelId] = useState<string>(mockParcels[0].id);

  useEffect(() => {
    fetchParcels(job_id)
      .then((fc) => {
        const loaded = featureCollectionToParcels(fc) as Parcel[];
        if (loaded.length > 0) {
          setParcels(loaded);
          setSelectedParcelId(loaded[0].id);
        }
      })
      .catch(() => {
        // Backend not available — fall back to mock data silently
      })
      .finally(() => setLoading(false));
  }, [job_id]);

  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const flaggedParcels = parcels.filter(p => p.properties.discrepancy_flag);

  const stats = {
    total: parcels.length,
    verified: parcels.filter(p => p.properties.status === 'verified').length,
    flagged: parcels.filter(p => p.properties.status === 'flagged').length,
    pending: parcels.filter(p => p.properties.status === 'pending').length,
  };

  return (
    <div className="pb-12 px-6" style={{ paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <SectionLabel className="mb-2 block">EXTRACTION RESULTS</SectionLabel>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-heading text-2xl">Parcel Map Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm" style={{ color: 'var(--color-stone-400)' }}>
                  {loading
                    ? 'Loading extracted boundaries…'
                    : 'AI-extracted boundaries from uploaded drone imagery'}
                </p>
                {filename && !loading && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(74,222,128,0.08)',
                      border: '1px solid rgba(74,222,128,0.2)',
                      color: '#4ADE80',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {filename}
                  </span>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-5">
              {[
                { label: 'Total', value: stats.total, color: '#fff' },
                { label: 'Verified', value: stats.verified, color: '#4ADE80' },
                { label: 'Flagged', value: stats.flagged, color: '#FBBF24' },
                { label: 'Pending', value: stats.pending, color: '#A8A29E' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
                  <span className="text-xs" style={{ color: 'var(--color-stone-400)' }}>{stat.label}</span>
                  <span className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content — Map + Detail Card */}
        <div className="grid lg:grid-cols-5 gap-5 mb-8">
          {/* Map — 3 columns */}
          <div className="lg:col-span-3" style={{ minHeight: '500px' }}>
            <ParcelMap
              parcels={parcels}
              selectedParcelId={selectedParcelId}
              onParcelSelect={setSelectedParcelId}
            />
          </div>

          {/* Detail Card — 2 columns */}
          <div className="lg:col-span-2">
            {selectedParcel && <ParcelDetailCard parcel={selectedParcel} />}
          </div>
        </div>

        {/* Discrepancy Review Panel */}
        <DiscrepancyPanel
          flaggedParcels={flaggedParcels}
          onReview={(id) => {
            setSelectedParcelId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
};
