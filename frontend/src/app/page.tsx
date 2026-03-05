'use client';

import { motion } from 'framer-motion';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSection, FeaturesSection, StatsSection, HowItWorksSection, Footer } from '@/components/landing';

// Animation variants for scroll-triggered animations
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section - No animation needed as it's above the fold */}
      <HeroSection />

      {/* Features Section with scroll animation */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <FeaturesSection />
      </motion.div>

      {/* Stats Section with scroll animation */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <StatsSection />
      </motion.div>

      {/* How It Works Section with scroll animation */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <HowItWorksSection />
      </motion.div>

      {/* Technology Stack Section with staggered card animations */}
      <motion.div
        className="container mx-auto px-4 py-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="text-center space-y-4" variants={fadeInUp}>
          <h2 className="text-3xl font-bold">Built on Creditcoin</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leveraging blockchain technology for transparent, secure, and efficient invoice financing
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 gap-4 mt-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={scaleIn}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">On-Chain</CardTitle>
                <CardDescription>Credit Scoring</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">NFT-Based</CardTitle>
                <CardDescription>Invoice Tokens</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Multi-Sig</CardTitle>
                <CardDescription>Governance</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">IPFS</CardTitle>
                <CardDescription>Document Storage</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer with fade-in animation */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <Footer />
      </motion.div>
    </div>
  );
}
