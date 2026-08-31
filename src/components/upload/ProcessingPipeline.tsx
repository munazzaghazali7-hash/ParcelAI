import React from 'react';

export type PipelineStep = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

interface ProcessingPipelineProps {
  steps: PipelineStep[];
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps }) => {
  const getStepColor = (status: PipelineStep['status']) => {
    switch (status) {
      case 'done': return '#4ADE80';
      case 'active': return '#FBBF24';
      case 'pending': return 'var(--color-stone-500)';
    }
  };

  const getLineColor = (currentStatus: PipelineStep['status']) => {
    return currentStatus === 'done' ? '#4ADE80' : 'var(--color-border-default)';
  };

  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {/* Step */}
          <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
            {/* Number + Dot */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: getStepColor(step.status),
                  opacity: step.status === 'pending' ? 0.5 : 1,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div
                className={`w-2.5 h-2.5 rounded-full ${step.status === 'active' ? 'animate-pulse-dot' : ''}`}
                style={{ background: getStepColor(step.status) }}
              />
            </div>

            {/* Label */}
            <span
              className="text-xs font-medium text-center whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: step.status === 'pending' ? 'var(--color-stone-500)' : 'var(--color-stone-200)',
              }}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className="flex-grow h-px mx-3 mt-[-18px]"
              style={{ background: getLineColor(step.status) }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
