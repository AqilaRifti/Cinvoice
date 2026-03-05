'use client';

import { useState } from 'react';
import {
    AnimatedCounter,
    CurrencyCounter,
    PercentageCounter,
    CompactCounter,
    IntegerCounter,
} from './animated-counter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example usage of AnimatedCounter components
 * 
 * This file demonstrates various use cases for the AnimatedCounter component
 * and its specialized variants.
 */

export function AnimatedCounterExamples() {
    const [count, setCount] = useState(1234);
    const [currency, setCurrency] = useState(100.5);
    const [percentage, setPercentage] = useState(75.5);
    const [compact, setCompact] = useState(1500000);

    const increment = (setter: React.Dispatch<React.SetStateAction<number>>, amount: number) => {
        setter((prev) => prev + amount);
    };

    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, amount: number) => {
        setter((prev) => Math.max(0, prev - amount));
    };

    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">AnimatedCounter Examples</h1>
                <p className="text-muted-foreground">
                    Interactive examples demonstrating the AnimatedCounter component
                </p>
            </div>

            {/* Basic Counter */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Counter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <AnimatedCounter
                            value={count}
                            className="text-5xl font-bold text-primary"
                        />
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => decrement(setCount, 100)}>-100</Button>
                        <Button onClick={() => increment(setCount, 100)}>+100</Button>
                        <Button onClick={() => setCount(Math.floor(Math.random() * 10000))}>
                            Random
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Currency Counter */}
            <Card>
                <CardHeader>
                    <CardTitle>Currency Counter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <CurrencyCounter
                            value={currency}
                            currency="CTC"
                            className="text-5xl font-bold text-green-600"
                        />
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => decrement(setCurrency, 10)}>-10</Button>
                        <Button onClick={() => increment(setCurrency, 10)}>+10</Button>
                        <Button onClick={() => setCurrency(Math.random() * 1000)}>
                            Random
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Percentage Counter */}
            <Card>
                <CardHeader>
                    <CardTitle>Percentage Counter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <PercentageCounter
                            value={percentage}
                            className="text-5xl font-bold text-blue-600"
                        />
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => decrement(setPercentage, 5)}>-5%</Button>
                        <Button onClick={() => increment(setPercentage, 5)}>+5%</Button>
                        <Button onClick={() => setPercentage(Math.random() * 100)}>
                            Random
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Compact Counter */}
            <Card>
                <CardHeader>
                    <CardTitle>Compact Counter (K/M/B notation)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <CompactCounter
                            value={compact}
                            className="text-5xl font-bold text-purple-600"
                        />
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={() => decrement(setCompact, 100000)}>-100K</Button>
                        <Button onClick={() => increment(setCompact, 100000)}>+100K</Button>
                        <Button onClick={() => setCompact(Math.floor(Math.random() * 10000000))}>
                            Random
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Multiple Formats Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Dashboard Example</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <IntegerCounter
                                value={count}
                                className="text-2xl font-bold"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CurrencyCounter
                                value={currency * 1000}
                                className="text-2xl font-bold"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                +8% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PercentageCounter
                                value={percentage}
                                className="text-2xl font-bold text-green-600"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                +2% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CompactCounter
                                value={compact}
                                className="text-2xl font-bold"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                +15% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Custom Formatting Examples */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Formatting Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">With Prefix</p>
                            <AnimatedCounter
                                value={count}
                                prefix="+"
                                className="text-3xl font-bold text-green-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-2">With Suffix</p>
                            <AnimatedCounter
                                value={count}
                                suffix=" items"
                                className="text-3xl font-bold"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Decimal Format</p>
                            <AnimatedCounter
                                value={currency}
                                format="decimal"
                                decimals={3}
                                className="text-3xl font-bold"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Custom Duration</p>
                            <AnimatedCounter
                                value={count}
                                duration={2000}
                                className="text-3xl font-bold text-blue-600"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Real-world Use Cases */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Real-world Use Cases</h2>

                {/* Portfolio Summary */}
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Portfolio Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Invested</span>
                            <CurrencyCounter
                                value={currency * 10}
                                className="font-semibold"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Returned</span>
                            <CurrencyCounter
                                value={currency * 12}
                                className="font-semibold"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">ROI</span>
                            <PercentageCounter
                                value={20}
                                className="font-semibold text-green-600"
                                prefix="+"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Credit Score */}
                <Card>
                    <CardHeader>
                        <CardTitle>Credit Score</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <IntegerCounter
                            value={750}
                            className="text-6xl font-bold text-green-600"
                            duration={1500}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                            Range: 300-850
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AnimatedCounterExamples;
