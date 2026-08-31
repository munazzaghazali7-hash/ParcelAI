import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Button } from '../components/ui/Button';
import { DropZone } from '../components/upload/DropZone';
import { ProcessingPipeline, type PipelineStep } from '../components/upload/ProcessingPipeline';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>([
    { label: 'Uploading', status: 'pending' },
    { label: 'Orthomosaic check', status: 'pending' },
    { label: 'Running segmentation', status: 'pending' },
    { label: 'Done', status: 'pending' },
  ]);

  const simulateProcessing = useCallback(() => {
    setProcessing(true);

    // Step 1 — Uploading
    setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active' } : s));

    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => {
        if (i === 0) return { ...s, status: 'done' };
        if (i === 1) return { ...s, status: 'active' };
        return s;
      }));
    }, 1200);

    // Step 2 — Orthomosaic check
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => {
        if (i <= 1) return { ...s, status: 'done' };
        if (i === 2) return { ...s, status: 'active' };
        return s;
      }));
    }, 2800);

    // Step 3 — Segmentation
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => {
        if (i <= 2) return { ...s, status: 'done' };
        if (i === 3) return { ...s, status: 'active' };
        return s;
      }));
    }, 4800);

    // Step 4 — Done
    setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      setTimeout(() => navigate('/dashboard'), 800);
    }, 5800);
  }, [navigate]);

  const handleFileSelect = (f: File) => {
    setFile(f);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pb-16" style={{ paddingTop: '120px' }}>
      <div className="w-full max-w-xl">
        <div className="card">
          {/* Header */}
          <div className="mb-6">
            <SectionLabel className="mb-3 block">STEP 1 — UPLOAD</SectionLabel>
            <h2 className="text-heading text-2xl">Upload drone imagery</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-stone-400)' }}>
              Upload orthomosaic or raw drone imagery for AI-based parcel boundary extraction.
            </p>
          </div>

          {/* Drop Zone */}
          {!file ? (
            <DropZone onFileSelect={handleFileSelect} />
          ) : (
            <div className="mb-6">
              {/* File info */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-stone-500)', fontFamily: 'var(--font-mono)' }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!processing && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const })));
                    }}
                    className="p-1.5 rounded-md transition-colors cursor-pointer"
                    style={{ color: 'var(--color-stone-500)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Pipeline */}
              {processing && (
                <div className="py-4 animate-fade-in">
                  <ProcessingPipeline steps={steps} />
                </div>
              )}
            </div>
          )}

          {/* Run Button */}
          {file && !processing && (
            <div className="mt-6">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={simulateProcessing}
              >
                Run Extraction
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
