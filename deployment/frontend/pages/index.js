import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import CallToAction from '../components/home/CallToAction';
import { useUI } from '../contexts';

export default function Home() {
  const { isDarkMode } = useUI();
  
  return (
    <Layout>
      <Head>
        <title>AGI AUTO Builder - AI-Powered Software Development</title>
        <meta name="description" content="Build intelligent applications with automated AI workflows. Streamline development, reduce complexity, and go from concept to production faster than ever." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <HeroSection />
        <FeatureSection />
        <CallToAction />
      </div>
    </Layout>
  );
}
