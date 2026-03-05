'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NetworkStatusBadge } from '@/components/layout/network-status-badge';
import { Github, Twitter, MessageCircle, FileText, BookOpen, Code, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
    product: [
        { label: 'For SMBs', href: '/dashboard/smb' },
        { label: 'For Investors', href: '/dashboard/investor' },
        { label: 'Marketplace', href: '/dashboard/investor' },
        { label: 'How It Works', href: '#how-it-works' },
    ],
    resources: [
        { label: 'Documentation', href: '/docs', icon: BookOpen },
        { label: 'Smart Contracts', href: '/contracts', icon: Code },
        { label: 'Whitepaper', href: '/whitepaper', icon: FileText },
        { label: 'Community', href: '/community', icon: Users },
    ],
    social: [
        { label: 'GitHub', href: 'https://github.com/creditcoin', icon: Github },
        { label: 'Twitter', href: 'https://twitter.com/creditcoin', icon: Twitter },
        { label: 'Discord', href: 'https://discord.gg/creditcoin', icon: MessageCircle },
    ],
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
                >
                    {/* Brand Section */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <h3 className="text-2xl font-bold">Creditcoin</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Decentralized invoice financing platform powered by blockchain technology.
                            Get instant liquidity or invest in real-world assets.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Network Status:</span>
                            <NetworkStatusBadge />
                        </div>
                    </motion.div>

                    {/* Product Links */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources Links */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                                        >
                                            <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Community</h4>
                        <ul className="space-y-3">
                            {footerLinks.social.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                                        >
                                            <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            {link.label}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="pt-4">
                            <p className="text-xs text-muted-foreground">
                                Join our community to stay updated with the latest news and developments.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                <Separator className="my-8" />

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {currentYear} Creditcoin Invoice Financing. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
