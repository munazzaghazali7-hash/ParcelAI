import React from 'react';

export type PipelineStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

interface ProcessingPipelineProps {
  steps: PipelineStep[];
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps }) => {
  const getColor = (status: PipelineStep['status']) => {
    switch (status) {
      case 'done':    return '#4ADE80';
      case 'active':  return '#FBBF24';
      case 'pending': return 'var(--color-stone-600)';
    }
  };

  const getIcon = (status: PipelineStep['status'], idx: number) => {
    if (status === 'done') {
      return (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <polyline points="2,6 5,9 10,3" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (status === 'active') {
      return (
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#FBBF24' }}
        />
      );
    }
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-stone-600)' }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-0">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 py-2"
          style={{
            borderBottom: i < steps.length - 2
              ? '1px solid rgba(255,255,255,0.04)'
              : 'none',
          }}
        >
          {/* Icon circle */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: step.status === 'done'
                ? 'rgba(74,222,128,0.12)'
                : step.status === 'active'
                ? 'rgba(251,191,36,0.12)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                step.status === 'pending'
                  ? 'rgba(255,255,255,0.08)'
                  : getColor(step.status) + '40'
              }`,
              transition: 'all 0.3s ease',
            }}
          >
            {getIcon(step.status, i)}
          </div>

          {/* Label */}
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: step.status === 'pending'
                ? 'var(--color-stone-600)'
                : step.status === 'active'
                ? '#FBBF24'
                : 'var(--color-stone-300)',
              transition: 'color 0.3s ease',
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
