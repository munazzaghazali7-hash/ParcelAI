import React from 'react';
import { SectionLabel } from '../ui/SectionLabel';
import { DiscrepancyCard } from './DiscrepancyCard';
import type { Parcel } from '../../data/mockParcels';

interface DiscrepancyPanelProps {
  flaggedParcels: Parcel[];
  onReview?: (parcelId: string) => void;
}

export const DiscrepancyPanel: React.FC<DiscrepancyPanelProps> = ({ flaggedParcels, onReview }) => {
  if (flaggedParcels.length === 0) return null;

  return (
    <section className="section-border pt-8">
      <div className="mb-5">
        <SectionLabel className="mb-2 block">FLAGGED FOR REVIEW</SectionLabel>
        <h3 className="text-heading text-xl">Discrepancy Review</h3>
        <p className="text-body mt-1.5">
          {flaggedParcels.length} parcels flagged with boundary discrepancies requiring officer review.
        </p>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
        {flaggedParcels.map(parcel => (
          <DiscrepancyCard key={parcel.id} parcel={parcel} onReview={onReview} />
        ))}
      </div>
    </section>
  );
};
