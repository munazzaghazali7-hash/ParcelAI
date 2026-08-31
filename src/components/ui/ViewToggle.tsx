import React from 'react';

interface ViewToggleProps {
  activeView: 'map' | 'api';
  onToggle: (view: 'map' | 'api') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onToggle, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center rounded-md overflow-hidden ${className}`}
      style={{
        border: '1px solid var(--color-border-default)',
        background: 'var(--color-navy-950)',
      }}
    >
      <button
        onClick={() => onToggle('map')}
        className="px-3.5 py-1.5 text-mono-ui transition-all duration-200 cursor-pointer"
        style={{
          background: activeView === 'map' ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: activeView === 'map' ? '#fff' : 'var(--color-stone-400)',
          borderRight: '1px solid var(--color-border-default)',
        }}
      >
        Map View
      </button>
      <button
        onClick={() => onToggle('api')}
        className="px-3.5 py-1.5 text-mono-ui transition-all duration-200 cursor-pointer"
        style={{
          background: activeView === 'api' ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: activeView === 'api' ? '#fff' : 'var(--color-text-secondary)',
        }}
      >
        API Response
      </button>
    </div>
  );
};
