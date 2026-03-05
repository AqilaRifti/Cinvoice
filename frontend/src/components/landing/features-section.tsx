'use client';

import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

const features = [
    {
        icon: Zap,
        title: 'Instant Liquidity',
        description:
            'SMBs can tokenize their invoices and receive immediate funding without waiting for payment terms. Get cash flow when you need it most.',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
    },
    {
        icon: Shield,
        title: 'Transparent Credit Scoring',
        description:
            'On-chain credit scores (300-850) provide transparent risk assessment. Build your reputation with every successful repayment.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        icon: TrendingUp,
        title: 'Secure & Decentralized',
        description:
            'Multi-sig governance, IPFS storage, and blockchain security ensure your assets are protected. No single point of failure.',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
        },
    },
};

const hoverVariants = {
    hover: {
        y: -8,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

export function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Why Choose Creditcoin?
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Experience the future of invoice financing with blockchain-powered transparency and security.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            feature={feature}
                            index={index}
                            isInView={isInView}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface FeatureCardProps {
    feature: typeof features[0];
    index: number;
    isInView: boolean;
}

function FeatureCard({ feature, index, isInView }: FeatureCardProps) {
    const Icon = feature.icon;

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: index * 0.2 }}
            whileHover="hover"
        >
            <motion.div variants={hoverVariants}>
                <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 hover:shadow-lg">
                    <CardHeader>
                        {/* Animated Icon */}
                        <motion.div
                            className={`w-16 h-16 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                            variants={iconVariants}
                            initial="hidden"
                            animate={isInView ? 'visible' : 'hidden'}
                            transition={{ delay: index * 0.2 + 0.3 }}
                        >
                            <Icon className={`h-8 w-8 ${feature.color}`} />
                        </motion.div>

                        <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                            {feature.description}
                        </CardDescription>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
