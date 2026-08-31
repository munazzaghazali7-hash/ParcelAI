import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SectionLabel } from '../components/ui/SectionLabel';

const GlyphBackground = () => {
  const [glyphs, setGlyphs] = useState<{ id: number; char: string; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const chars = ['+', '-', '㎡', '·', 'x', 'y', '{', '}', '[', ']', '0', '1', '°', '′', '″'];
    const newGlyphs = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${8 + Math.random() * 8}s`,
    }));
    setGlyphs(newGlyphs);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {glyphs.map(g => (
        <span
          key={g.id}
          className="animate-glyph absolute top-0"
          style={{
            left: g.left,
            '--delay': g.delay,
            '--duration': g.duration,
          } as React.CSSProperties}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'AI Boundary Detection',
      description: 'Deep learning models trained on satellite and drone imagery automatically detect and delineate parcel boundaries with sub-meter accuracy.',
      bullets: ['Semantic segmentation pipeline', 'Sub-meter boundary precision', 'Works with any drone platform'],
    },
    {
      title: 'Cadastral Record Matching',
      description: 'Cross-reference AI-detected boundaries against existing revenue and cadastral records to identify discrepancies instantly.',
      bullets: ['Automated record comparison', 'Discrepancy flagging & scoring', 'Integration with land registries'],
    },
    {
      title: 'GeoJSON & PostGIS Export',
      description: 'Export verified parcel data in industry-standard formats. PostGIS-ready schemas for direct integration with your GIS stack.',
      bullets: ['GeoJSON, Shapefile, KML export', 'PostGIS-compatible schemas', 'Batch processing support'],
    },
    {
      title: 'Review & Verification',
      description: 'Built-in workflow for survey officers to review flagged parcels, compare overlays, and approve final boundary records.',
      bullets: ['Side-by-side comparison view', 'Officer approval workflow', 'Audit trail for every parcel'],
    },
  ];

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative pt-[160px] pb-[120px] px-6 flex flex-col items-center justify-center min-h-[90vh]">
        <GlyphBackground />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <SectionLabel className="mb-6 block">AI-POWERED CADASTRAL MAPPING</SectionLabel>

          <h1 className="text-display mb-12">
            Map every parcel.
            <br />
            <span style={{ color: 'var(--color-text-muted)' }}>Automatically.</span>
          </h1>

          <p className="text-body text-lg max-w-xl mx-auto mb-16">
            Upload drone imagery. Our AI extracts parcel boundaries, compares them against
            cadastral records, and flags discrepancies — all through a single API.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg" as="a" href="/upload">
              Try demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
            <Button variant="ghost" size="lg" as="a" href="#developers">
              View docs
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Built For Strip ─── */}
      <section className="section-border py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['SVAMITVA-ready', 'GIS-compatible', 'SIH 2026', 'PostGIS-native', 'CORS-enabled API'].map(badge => (
              <span
                key={badge}
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: 'var(--color-stone-500)' }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="section-border py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <SectionLabel className="mb-4 block">CAPABILITIES</SectionLabel>
            <h2 className="text-heading mb-4">Designed to help you build</h2>
            <p className="text-body text-base">
              Everything you need to automate land parcel mapping — from drone image upload to
              verified cadastral records, in a single developer-friendly platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-10 transition-colors duration-200 border rounded-xl"
                style={{ background: 'var(--color-black-800)', borderColor: 'var(--color-border-default)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                  e.currentTarget.style.backgroundColor = '#161616';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)';
                  e.currentTarget.style.backgroundColor = 'var(--color-black-800)';
                }}
              >
                <h3 className="text-white font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-sm mb-8" style={{ color: 'var(--color-stone-400)', lineHeight: '1.65' }}>
                  {feature.description}
                </p>
                <ul className="flex flex-col gap-4 mb-8">
                  {feature.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-stone-300)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/upload"
                  className="text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200"
                  style={{ color: 'var(--color-stone-400)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-stone-400)')}
                >
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Developer Section ─── */}
      <section id="developers" className="section-border py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — Code Snippet */}
            <div>
              <SectionLabel className="mb-4 block">FOR DEVELOPERS</SectionLabel>
              <h2 className="text-heading mb-6">Start mapping today</h2>

              <pre className="code-block text-sm mb-4" style={{ fontSize: '13px' }}>
                <code>{`$ curl -X POST https://api.parcelai.dev/v1/extract \\
  -H "Authorization: Bearer sk_test_..." \\
  -F "image=@drone_survey.tif" \\
  -F "region=UP" \\
  -F "compare_cadastral=true"

{
  "job_id": "job_8f3k2m",
  "status": "processing",
  "parcels_detected": 47,
  "discrepancies": 3,
  "export_url": "/v1/export/job_8f3k2m.geojson"
}`}</code>
              </pre>
            </div>

            {/* Right — Feature bullets */}
            <div className="pt-12">
              <ul className="flex flex-col gap-6">
                {[
                  {
                    title: 'Fast segmentation',
                    desc: 'GPU-accelerated boundary detection processes a 500MB orthomosaic in under 30 seconds.',
                  },
                  {
                    title: 'GeoJSON export',
                    desc: 'Every parcel returned as a standards-compliant GeoJSON Feature with properties.',
                  },
                  {
                    title: 'PostGIS-ready',
                    desc: 'Schemas designed for direct import into PostGIS. Full spatial indexing support.',
                  },
                  {
                    title: 'Free sandbox',
                    desc: 'Test with sample imagery in our sandbox environment. No credit card required.',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'rgba(74, 222, 128, 0.08)',
                        border: '1px solid rgba(74, 222, 128, 0.15)',
                      }}
                    >
                      <span style={{ color: '#4ADE80', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                      <p className="text-sm" style={{ color: 'var(--color-stone-400)', lineHeight: '1.6' }}>
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="section-border py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-heading mb-4">Ready to automate land surveys?</h2>
          <p className="text-body text-base mb-8">
            Join survey departments and GIS teams using ParcelAI to modernize
            cadastral mapping across India.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg" as="a" href="/upload">
              Try demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
            <Button variant="ghost" size="lg">
              Contact sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
