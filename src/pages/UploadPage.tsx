import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Button } from '../components/ui/Button';
import { DropZone } from '../components/upload/DropZone';
import { ProcessingPipeline, type PipelineStep } from '../components/upload/ProcessingPipeline';
import { uploadImagery, pollStatus } from '../api/parcelApi';

const PIPELINE_STEPS: PipelineStep[] = [
  { label: 'Uploading imagery', status: 'pending' },
  { label: 'Parsing EXIF & metadata', status: 'pending' },
  { label: 'Running edge detection', status: 'pending' },
  { label: 'Segmenting parcel boundaries', status: 'pending' },
  { label: 'Cross-referencing cadastral records', status: 'pending' },
  { label: 'Generating extraction report', status: 'pending' },
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS);

  const markUpTo = (index: number, activeStatus: PipelineStep['status'] = 'active') => {
    setSteps(prev =>
      prev.map((s, i) => {
        if (i < index) return { ...s, status: 'done' };
        if (i === index) return { ...s, status: activeStatus };
        return { ...s, status: 'pending' };
      }),
    );
  };

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      // Step 0 active — uploading
      markUpTo(0, 'active');
      const { job_id } = await uploadImagery(file);

      // Poll backend — advance pipeline steps as status.step increments
      await pollStatus(
        job_id,
        (status) => {
          if (status.status === 'done') {
            setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
          } else {
            const idx = Math.min(status.step, PIPELINE_STEPS.length - 1);
            markUpTo(idx, 'active');
          }
        },
        600,
      );

      // All done — navigate to dashboard, pass job_id so it fetches correct parcels
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      setTimeout(() => navigate('/dashboard', { state: { job_id, filename: file.name } }), 700);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setSteps(prev =>
        prev.map(s => (s.status === 'active' ? { ...s, status: 'pending' } : s)),
      );
      setProcessing(false);
    }
  }, [file, navigate]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setError(null);
    setSteps(PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' as const })));
    // Generate a local object URL for the image preview
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSteps(PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' as const })));
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
              {/* Image preview + file info */}
              <div
                className="rounded-lg mb-5 overflow-hidden"
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Drone image thumbnail */}
                {previewUrl && (
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={previewUrl}
                      alt="Uploaded drone imagery"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: processing ? 'brightness(0.6)' : 'brightness(0.85)',
                        transition: 'filter 0.4s ease',
                      }}
                    />
                    {/* Overlay label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#A8A29E',
                        letterSpacing: '0.08em',
                      }}
                    >
                      DRONE IMAGERY · ORTHOMOSAIC
                    </div>
                    {processing && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            padding: '6px 14px',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)',
                            borderRadius: '8px',
                            border: '1px solid rgba(74,222,128,0.3)',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: '#4ADE80',
                            letterSpacing: '0.1em',
                          }}
                        >
                          ◉ ANALYSING
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* File meta row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-stone-500)', fontFamily: 'var(--font-mono)' }}>
                      {formatFileSize(file.size)} · JPEG / TIFF
                    </p>
                  </div>
                  {!processing && (
                    <button
                      onClick={handleRemove}
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
              </div>

              {/* Pipeline */}
              {processing && (
                <div className="py-2 animate-fade-in">
                  <ProcessingPipeline steps={steps} />
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="mt-4 px-4 py-3 rounded-lg text-sm animate-fade-in"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#FCA5A5',
                  }}
                >
                  <strong style={{ color: '#F87171' }}>Extraction failed:</strong> {error}
                  <br />
                  <span style={{ color: 'var(--color-stone-400)', fontSize: '11px' }}>
                    Make sure the backend is running at <code>http://localhost:8000</code>
                  </span>
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
                onClick={handleExtract}
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
