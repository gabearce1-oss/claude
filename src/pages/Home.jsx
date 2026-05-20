import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import HomeHero from '../components/home/HomeHero';
import HomeOverview from '../components/home/HomeOverview';
import HomeStats from '../components/home/HomeStats';
import HomeFooter from '../components/home/HomeFooter';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#f4ede0', minHeight: '100vh' }}>
      <HomeHero isAuthenticated={isAuthenticated} />
      <HomeStats />
      <HomeOverview />
      <HomeFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}