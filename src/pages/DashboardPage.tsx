import React, { useState } from 'react';
import { SectionLabel } from '../components/ui/SectionLabel';
import { ParcelMap } from '../components/map/ParcelMap';
import { ParcelDetailCard } from '../components/dashboard/ParcelDetailCard';
import { DiscrepancyPanel } from '../components/dashboard/DiscrepancyPanel';
import { mockParcels } from '../data/mockParcels';

export const DashboardPage: React.FC = () => {
  const [selectedParcelId, setSelectedParcelId] = useState<string>(mockParcels[0].id);

  const selectedParcel = mockParcels.find(p => p.id === selectedParcelId) || mockParcels[0];

  const stats = {
    total: mockParcels.length,
    verified: mockParcels.filter(p => p.properties.status === 'verified').length,
    flagged: mockParcels.filter(p => p.properties.status === 'flagged').length,
    pending: mockParcels.filter(p => p.properties.status === 'pending').length,
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
              <p className="text-sm mt-1" style={{ color: 'var(--color-stone-400)' }}>
                AI-extracted boundaries from uploaded drone imagery
              </p>
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
              selectedParcelId={selectedParcelId}
              onParcelSelect={setSelectedParcelId}
            />
          </div>

          {/* Detail Card — 2 columns */}
          <div className="lg:col-span-2">
            <ParcelDetailCard parcel={selectedParcel} />
          </div>
        </div>

        {/* Discrepancy Review Panel */}
        <DiscrepancyPanel
          onReview={(id) => {
            setSelectedParcelId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
};
