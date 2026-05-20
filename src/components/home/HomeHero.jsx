import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HomeHero({ isAuthenticated }) {
  const handleLogin = () => base44.auth.redirectToLogin('/dashboard');

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderBottom: '1px solid #d4cdb8',
        background: 'linear-gradient(180deg, #f4ede0 0%, #ebe1ce 100%)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(26,24,21,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
        }}
      />
      <div className="max-w-6xl mx-auto px-8 py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="text-xs mb-5 inline-flex items-center gap-2"
            style={{
              color: '#3a3530',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 6, height: 6, background: '#c44536', borderRadius: '50%' }} />
            TruthEngine360 · Forensic Historical Intelligence
          </div>
          <h1
            className="text-6xl md:text-7xl font-light leading-none mb-5"
            style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', letterSpacing: '-0.02em' }}
          >
            The Terminel–Sagasta <em style={{ fontWeight: 500 }}>Case File</em>
          </h1>
          <p
            className="text-xl max-w-2xl mb-10"
            style={{
              color: '#3a3530',
              fontFamily: 'Cormorant Garamond',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            An audit-disciplined investigation across six generations and three archives —
            tracking provenance, claims, and chain of custody for every piece of evidence.
          </p>

          <div className="flex gap-3 flex-wrap">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#1a1815',
                  color: '#f4ede0',
                  border: '1px solid #1a1815',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Enter Case File
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-5 py-3 rounded text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#1a1815',
                  color: '#f4ede0',
                  border: '1px solid #1a1815',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                }}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in to Access
              </button>
            )}
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-5 py-3 rounded text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#ffffff',
                color: '#1a1815',
                border: '1px solid #1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
              }}
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}