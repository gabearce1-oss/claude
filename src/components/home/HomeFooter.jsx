import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LogIn, ArrowRight } from 'lucide-react';

export default function HomeFooter({ isAuthenticated }) {
  const handleLogin = () => base44.auth.redirectToLogin('/dashboard');

  return (
    <div style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}>
      <div className="max-w-6xl mx-auto px-8 py-16 text-center">
        <h2
          className="text-4xl font-light mb-4"
          style={{ fontFamily: 'Cormorant Garamond' }}
        >
          Ready to enter the case file?
        </h2>
        <p
          className="text-lg mb-8 max-w-xl mx-auto opacity-80"
          style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}
        >
          Researchers and authorized contributors can access the full evidence dashboard, provenance map,
          and audit checklist.
        </p>
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#f4ede0',
              color: '#1a1815',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
            }}
          >
            Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#f4ede0',
              color: '#1a1815',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
            }}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign in
          </button>
        )}
        <p
          className="text-xs mt-12 opacity-60"
          style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}
        >
          TruthEngine360 · Terminel–Sagasta Case File · v1 · 2026
        </p>
      </div>
    </div>
  );
}