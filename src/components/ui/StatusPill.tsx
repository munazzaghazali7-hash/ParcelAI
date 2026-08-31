import React from 'react';

interface StatusPillProps {
  status: 'verified' | 'flagged' | 'pending' | 'processing';
  label?: string;
  className?: string;
}

const statusConfig = {
  verified: {
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.25)',
    text: '#4ADE80',
    dot: '#4ADE80',
    defaultLabel: 'Verified',
  },
  flagged: {
    bg: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.25)',
    text: '#FBBF24',
    dot: '#FBBF24',
    defaultLabel: 'Flagged',
  },
  pending: {
    bg: 'rgba(168, 162, 158, 0.1)',
    border: 'rgba(168, 162, 158, 0.2)',
    text: '#A8A29E',
    dot: '#A8A29E',
    defaultLabel: 'Pending',
  },
  processing: {
    bg: 'rgba(147, 197, 253, 0.1)',
    border: 'rgba(147, 197, 253, 0.25)',
    text: '#93C5FD',
    dot: '#93C5FD',
    defaultLabel: 'Processing',
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className = '' }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-mono-ui ${className}`}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {label || config.defaultLabel}
    </span>
  );
};
