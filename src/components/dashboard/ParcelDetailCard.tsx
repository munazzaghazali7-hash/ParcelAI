import React, { useState } from 'react';
import { SectionLabel } from '../ui/SectionLabel';
import { StatusPill } from '../ui/StatusPill';
import { ViewToggle } from '../ui/ViewToggle';
import { CodeBlock } from '../ui/CodeBlock';
import type { Parcel } from '../../data/mockParcels';

interface ParcelDetailCardProps {
  parcel: Parcel;
}

export const ParcelDetailCard: React.FC<ParcelDetailCardProps> = ({ parcel }) => {
  const [view, setView] = useState<'map' | 'api'>('map');

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'detection':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(147, 197, 253, 0.15)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#93C5FD' }} />
          </div>
        );
      case 'comparison':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168, 162, 158, 0.15)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#A8A29E' }} />
          </div>
        );
      case 'flag':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} />
          </div>
        );
      case 'verification':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74, 222, 128, 0.15)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
          </div>
        );
      default:
        return null;
    }
  };

  const apiResponse = {
    'parcel-id': parcel.id,
    geometry: {
      type: parcel.geometry.type,
      coordinates: '[[...]]',
    },
    confidence: parcel.properties.confidence,
    'area-sqm': parcel.properties.area_sqm,
    'perimeter-m': parcel.properties.perimeter_m,
    'land-use': parcel.properties.land_use,
    'discrepancy-flag': parcel.properties.discrepancy_flag,
    status: parcel.properties.status,
  };

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <SectionLabel>PARCEL · #{parcel.id}</SectionLabel>
          <h3 className="text-heading-sm mt-1.5">{parcel.name}</h3>
        </div>
        <ViewToggle activeView={view} onToggle={setView} />
      </div>

      {/* Status */}
      <div className="mb-5">
        <StatusPill
          status={parcel.properties.status}
          label={parcel.properties.status === 'verified' ? 'SW: Verified' : parcel.properties.status === 'flagged' ? 'Flagged for review' : 'Pending'}
        />
      </div>

      {view === 'map' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-px mb-5" style={{ background: 'var(--color-border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { label: 'AREA', value: `${parcel.properties.area_sqm} sq.m`, mono: true },
              { label: 'PERIMETER', value: `${parcel.properties.perimeter_m} m`, mono: true },
              { label: 'CONFIDENCE', value: `${(parcel.properties.confidence * 100).toFixed(0)}%`, mono: true },
              { label: 'LAND USE', value: parcel.properties.land_use, mono: false },
            ].map(stat => (
              <div key={stat.label} className="p-4" style={{ background: 'var(--color-navy-950)' }}>
                <SectionLabel className="mb-1.5 block">{stat.label}</SectionLabel>
                <span className={`text-white font-medium text-base ${stat.mono ? 'font-mono' : ''}`} style={stat.mono ? { fontFamily: 'var(--font-mono)' } : {}}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div>
            <SectionLabel className="mb-3 block">RECENT ACTIVITY</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {parcel.activity.map((act, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2.5 px-3 rounded-md transition-colors duration-150"
                  style={{ background: i === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  {activityIcon(act.type)}
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-stone-200 leading-snug">{act.action}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-stone-500)', fontFamily: 'var(--font-mono)' }}>
                      {formatTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* API Response View */
        <div>
          <SectionLabel className="mb-3 block">API RESPONSE</SectionLabel>
          <CodeBlock data={apiResponse} />
          <p className="text-xs mt-3" style={{ color: 'var(--color-stone-500)', fontFamily: 'var(--font-mono)' }}>
            GET /api/parcels/{parcel.id}
          </p>
        </div>
      )}
    </div>
  );
};
