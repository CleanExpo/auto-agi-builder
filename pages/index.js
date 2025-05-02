import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
    return (
        <>
            <Head>
                <title>Auto AGI Builder - AI-Powered Application Development</title>
                <meta name="description" content="Auto AGI Builder streamlines the development process with AI-powered requirements analysis, prototype generation, and ROI calculation tools." />
                <meta name="keywords" content="AGI, artificial general intelligence, software development, AI-powered development, prototype generation, requirements analysis" />
                <meta name="author" content="Team AGI" />

                {/* Open Graph / Social Media Meta Tags */}
                <meta property="og:title" content="Auto AGI Builder - AI-Powered Application Development" />
                <meta property="og:description" content="Streamline your development process with AI-powered tools for requirements analysis, prototype generation, and ROI calculation." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://auto-agi-landing-bkssjtyt5-team-agi.vercel.app/" />
                <meta property="og:image" content="https://auto-agi-landing-bkssjtyt5-team-agi.vercel.app/og-image.png" />

                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>

            <header className={styles.header}>
                <div className={styles.container}>
                    <nav className={styles.nav}>
                        <div className={styles.logo}>Auto AGI Builder</div>
                        <ul className={styles.navLinks}>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.container}>
                        <h1>Build Intelligent Applications with AI</h1>
                        <p>Transform your ideas into reality with our AI-powered development platform</p>
                        <button className={styles.ctaButton}>Get Started</button>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className={styles.features}>
                    <div className={styles.container}>
                        <h2>Powerful Features</h2>
                        <div className={styles.featureGrid}>
                            {/* Feature cards will go here */}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className={styles.howItWorks}>
                    <div className={styles.container}>
                        <h2>How It Works</h2>
                        {/* Steps will go here */}
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className={styles.pricing}>
                    <div className={styles.container}>
                        <h2>Pricing Plans</h2>
                        {/* Pricing cards will go here */}
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className={styles.contact}>
                    <div className={styles.container}>
                        <h2>Get in Touch</h2>
                        {/* Contact form will go here */}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.container}>
                    <p>&copy; {new Date().getFullYear()} Auto AGI Builder. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
} 