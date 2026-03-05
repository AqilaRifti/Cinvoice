'use client';

import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    Upload,
    CheckCircle,
    Wallet,
    Search,
    TrendingUp,
    Shield,
    Users,
    Gavel,
    ArrowRight,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const roles = [
    {
        value: 'smb',
        label: 'SMB',
        description: 'Small & Medium Business',
        steps: [
            {
                icon: Upload,
                title: 'Upload Invoice',
                description: 'Upload your invoice PDF and enter basic details like face value and repayment date.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
            },
            {
                icon: FileText,
                title: 'Tokenize',
                description: 'Your invoice is minted as an NFT on the blockchain with metadata stored on IPFS.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
            },
            {
                icon: Wallet,
                title: 'Get Funded',
                description: 'Investors purchase your invoice NFT and you receive instant liquidity at a discount.',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
            },
            {
                icon: CheckCircle,
                title: 'Repay',
                description: 'Repay the full face value by the due date to maintain your credit score and reputation.',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
            },
        ],
    },
    {
        value: 'investor',
        label: 'Investor',
        description: 'Earn Returns',
        steps: [
            {
                icon: Search,
                title: 'Browse Marketplace',
                description: 'Explore available invoice NFTs with detailed information including credit scores and ROI.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
            },
            {
                icon: Shield,
                title: 'Assess Risk',
                description: 'Review SMB credit scores (300-850), repayment history, and expected returns.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
            },
            {
                icon: Wallet,
                title: 'Invest',
                description: 'Purchase invoice NFTs at a discount and receive ownership of the tokenized invoice.',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
            },
            {
                icon: TrendingUp,
                title: 'Earn Returns',
                description: 'Receive the full face value when the SMB repays, earning the difference as profit.',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
            },
        ],
    },
    {
        value: 'admin',
        label: 'Admin',
        description: 'Platform Governance',
        steps: [
            {
                icon: Shield,
                title: 'Monitor Platform',
                description: 'Track platform health, contract status, and key metrics in real-time.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
            },
            {
                icon: Gavel,
                title: 'Create Proposals',
                description: 'Propose platform changes like fee adjustments, pausing, or whitelist management.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
            },
            {
                icon: Users,
                title: 'Multi-Sig Approval',
                description: 'Proposals require 2 of 3 admin approvals for execution, ensuring decentralized control.',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
            },
            {
                icon: CheckCircle,
                title: 'Execute Actions',
                description: 'Approved proposals are executed on-chain, maintaining platform security and integrity.',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
            },
        ],
    },
];

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: 'easeOut',
        },
    }),
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
        },
    },
};

export function HowItWorksSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [activeTab, setActiveTab] = useState('smb');

    return (
        <section id="how-it-works" ref={ref} className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose your role and see how easy it is to get started with Creditcoin
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate={isInView ? 'animate' : 'initial'}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tab List */}
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
                            {roles.map((role) => (
                                <TabsTrigger
                                    key={role.value}
                                    value={role.value}
                                    className="flex flex-col items-center gap-1 py-3"
                                >
                                    <span className="font-semibold">{role.label}</span>
                                    <span className="text-xs text-muted-foreground hidden sm:block">
                                        {role.description}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Tab Content */}
                        {roles.map((role) => (
                            <TabsContent key={role.value} value={role.value} className="mt-0">
                                <RoleSteps steps={role.steps} isActive={activeTab === role.value} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>
            </div>
        </section>
    );
}

interface RoleStepsProps {
    steps: typeof roles[0]['steps'];
    isActive: boolean;
}

function RoleSteps({ steps, isActive }: RoleStepsProps) {
    return (
        <div className="space-y-8">
            {/* Desktop: Horizontal Layout */}
            <div className="hidden lg:block">
                <div className="grid grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            custom={index}
                            variants={stepVariants}
                            initial="hidden"
                            animate={isActive ? 'visible' : 'hidden'}
                        >
                            <StepCard step={step} index={index} isLast={index === steps.length - 1} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile/Tablet: Vertical Layout */}
            <div className="lg:hidden space-y-6">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        custom={index}
                        variants={stepVariants}
                        initial="hidden"
                        animate={isActive ? 'visible' : 'hidden'}
                    >
                        <StepCard
                            step={step}
                            index={index}
                            isLast={index === steps.length - 1}
                            isVertical
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

interface StepCardProps {
    step: typeof roles[0]['steps'][0];
    index: number;
    isLast: boolean;
    isVertical?: boolean;
}

function StepCard({ step, index, isLast, isVertical = false }: StepCardProps) {
    const Icon = step.icon;

    return (
        <div className="relative">
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300">
                <CardContent className="p-6">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                        {index + 1}
                    </div>

                    {/* Icon */}
                    <motion.div
                        className={cn(
                            'w-16 h-16 rounded-lg flex items-center justify-center mb-4',
                            step.bgColor
                        )}
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 + 0.2 }}
                    >
                        <Icon className={cn('h-8 w-8', step.color)} />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                    </p>
                </CardContent>
            </Card>

            {/* Arrow Connector */}
            {!isLast && (
                <div
                    className={cn(
                        'absolute flex items-center justify-center text-muted-foreground',
                        isVertical
                            ? 'left-1/2 -translate-x-1/2 -bottom-3 rotate-90'
                            : 'top-1/2 -translate-y-1/2 -right-3 hidden lg:flex'
                    )}
                >
                    <ArrowRight className="h-6 w-6" />
                </div>
            )}
        </div>
    );
}
