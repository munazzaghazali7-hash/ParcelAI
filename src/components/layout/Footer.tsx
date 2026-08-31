import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Parcel Mapping', href: '/#features' },
        { label: 'Boundary Detection', href: '/#features' },
        { label: 'GeoJSON Export', href: '/#features' },
        { label: 'Pricing', href: '/' },
      ],
    },
    {
      title: 'Developers',
      links: [
        { label: 'Documentation', href: '/#developers' },
        { label: 'API Reference', href: '/#developers' },
        { label: 'SDKs', href: '/' },
        { label: 'Sandbox', href: '/upload' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/' },
        { label: 'Blog', href: '/' },
        { label: 'Careers', href: '/' },
        { label: 'Contact', href: '/' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/' },
        { label: 'Terms of Service', href: '/' },
        { label: 'Security', href: '/' },
      ],
    },
  ];

  return (
    <footer className="section-border" style={{ background: 'var(--color-navy-950)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top — Logo + Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
                  <polyline points="2 8 12 14 22 8" />
                  <line x1="12" y1="14" x2="12" y2="22" />
                </svg>
              </div>
              <span className="text-white font-semibold text-base tracking-tight">
                Parcel<span style={{ color: 'var(--color-stone-400)' }}>AI</span>
              </span>
            </Link>
            <p className="text-body text-sm" style={{ color: 'var(--color-stone-500)' }}>
              AI-powered cadastral mapping from drone imagery.
            </p>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-label mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--color-stone-400)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-stone-200)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-stone-400)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — Copyright */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-stone-500)' }}>
            © {new Date().getFullYear()} ParcelAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs" style={{ color: 'var(--color-stone-500)' }}>
              Built for India's land survey modernization
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
