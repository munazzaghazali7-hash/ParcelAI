import React from 'react';
import { SectionLabel } from '../ui/SectionLabel';
import { Button } from '../ui/Button';
import type { Parcel } from '../../data/mockParcels';

interface DiscrepancyCardProps {
  parcel: Parcel;
  onReview?: (parcelId: string) => void;
}

export const DiscrepancyCard: React.FC<DiscrepancyCardProps> = ({ parcel, onReview }) => {
  return (
    <div className="card card-hover flex flex-col min-w-[300px] max-w-[340px]">
      {/* Header */}
      <SectionLabel className="mb-2">DISCREPANCY</SectionLabel>
      <h4 className="text-white font-medium text-base mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
        #{parcel.id}
      </h4>
      <p className="text-sm mb-4" style={{ color: 'var(--color-stone-300)' }}>
        {parcel.properties.discrepancy_description || 'Boundary deviation detected'}
      </p>

      {/* Bullet Facts */}
      <ul className="flex flex-col gap-2.5 mb-5 flex-grow">
        <li className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-stone-400)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--color-stone-300)' }}>
            Confidence: <span className="text-white font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {(parcel.properties.confidence * 100).toFixed(0)}%
            </span>
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-stone-400)" strokeWidth="2" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--color-stone-300)' }}>
            Shift distance: <span className="text-white font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {parcel.properties.shift_distance_m || 0}m
            </span>
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-stone-400)" strokeWidth="2" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--color-stone-300)' }}>
            Status: <span className="font-medium" style={{ color: '#FBBF24' }}>Pending officer review</span>
          </span>
        </li>
      </ul>

      {/* Review Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReview?.(parcel.id)}
        >
          Review
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
