'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Store, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const gradientAnimation = {
    animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
    transition: {
        duration: 10,
        ease: 'linear',
        repeat: Infinity,
    },
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 },
};

const buttonTap = {
    scale: 0.95,
};

export function HeroSection() {
    const [displayedText, setDisplayedText] = useState('');
    const fullText = 'Decentralized Invoice Financing';
    const typingSpeed = 100; // milliseconds per character

    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, typingSpeed);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"
                style={{
                    backgroundSize: '200% 200%',
                }}
                animate={gradientAnimation.animate}
                transition={gradientAnimation.transition}
            />

            {/* Content */}
            <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
                <motion.div
                    className="flex flex-col items-center text-center space-y-8"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Headline with Typewriter Effect */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                            <span className="block mb-2">Creditcoin</span>
                            <span className="block text-primary min-h-[1.2em]">
                                {displayedText}
                                <span className="animate-pulse">|</span>
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
                            Get instant liquidity for your invoices or invest in real-world assets.
                            Powered by blockchain technology for transparency and security.
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-stretch sm:items-center"
                    >
                        <Link href="/dashboard/smb" className="w-full sm:w-auto">
                            <motion.div whileHover={buttonHover} whileTap={buttonTap} className="w-full">
                                <Button size="lg" className="w-full sm:w-auto group">
                                    <Wallet className="mr-2 h-5 w-5" />
                                    Connect Wallet
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        </Link>

                        <Link href="/dashboard/investor" className="w-full sm:w-auto">
                            <motion.div whileHover={buttonHover} whileTap={buttonTap} className="w-full">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto group">
                                    <Store className="mr-2 h-5 w-5" />
                                    Browse Marketplace
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        </Link>

                        <Link href="#how-it-works" className="w-full sm:w-auto">
                            <motion.div whileHover={buttonHover} whileTap={buttonTap} className="w-full">
                                <Button size="lg" variant="ghost" className="w-full sm:w-auto group">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Learn More
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Blockchain Secured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>Multi-Sig Governance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                            <span>IPFS Storage</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>
        </section>
    );
}
