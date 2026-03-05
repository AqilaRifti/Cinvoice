'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CreditScoreBadgeProps {
    score: number;
    showIcon?: boolean;
    className?: string;
}

function getScoreConfig(score: number) {
    if (score >= 750) {
        return {
            label: 'Excellent',
            className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
            icon: TrendingUp,
        };
    } else if (score >= 500) {
        return {
            label: 'Good',
            className: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
            icon: Minus,
        };
    } else {
        return {
            label: 'Fair',
            className: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
            icon: TrendingDown,
        };
    }
}

export function CreditScoreBadge({
    score,
    showIcon = true,
    className
}: CreditScoreBadgeProps) {
    const config = getScoreConfig(score);
    const Icon = config.icon;

    return (
        <Badge
            className={cn(
                'transition-all duration-200 ease-in-out',
                config.className,
                className
            )}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            <span>{score}</span>
            <span className="text-[10px] opacity-90">({config.label})</span>
        </Badge>
    );
}
