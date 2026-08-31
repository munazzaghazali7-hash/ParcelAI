import React, { useState, useRef, useCallback } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
      style={{
        border: `2px dashed ${isDragOver ? 'rgba(74, 222, 128, 0.5)' : 'var(--color-border-default)'}`,
        background: isDragOver ? 'rgba(74, 222, 128, 0.03)' : 'transparent',
        minHeight: '200px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.tif,.tiff"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-stone-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <p className="text-sm text-stone-300 mb-2">
        Drag and drop your drone imagery here, or{' '}
        <span className="text-white font-medium underline underline-offset-2 decoration-stone-500">browse</span>
      </p>

      <p className="text-mono" style={{ color: 'var(--color-stone-500)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        Accepted: .jpg, .png, .tif &nbsp;·&nbsp; Max size: 2 GB
      </p>
    </div>
  );
};
