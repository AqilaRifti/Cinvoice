'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { InvoiceState } from '@/types';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs';

export interface MarketplaceFiltersState {
    creditScoreMin: number;
    creditScoreMax: number;
    faceValueMin: number;
    faceValueMax: number;
    dateFrom?: Date;
    dateTo?: Date;
    states: InvoiceState[];
    sortBy: string;
}

interface MarketplaceFiltersProps {
    onFiltersChange: (filters: MarketplaceFiltersState) => void;
    maxFaceValue?: number;
}

const SORT_OPTIONS = [
    { value: 'roi-desc', label: 'Highest ROI' },
    { value: 'risk-asc', label: 'Lowest Risk' },
    { value: 'date-asc', label: 'Soonest Repayment' },
    { value: 'value-desc', label: 'Highest Value' },
];

const STATE_OPTIONS = [
    { value: InvoiceState.Pending, label: 'Pending' },
    { value: InvoiceState.Funded, label: 'Funded' },
];

export function MarketplaceFilters({ onFiltersChange, maxFaceValue = 10000 }: MarketplaceFiltersProps) {
    // URL state management
    const [creditScoreMin, setCreditScoreMin] = useQueryState('creditMin', parseAsInteger.withDefault(300));
    const [creditScoreMax, setCreditScoreMax] = useQueryState('creditMax', parseAsInteger.withDefault(850));
    const [faceValueMin, setFaceValueMin] = useQueryState('valueMin', parseAsInteger.withDefault(0));
    const [faceValueMax, setFaceValueMax] = useQueryState('valueMax', parseAsInteger.withDefault(maxFaceValue));
    const [dateFrom, setDateFrom] = useQueryState('dateFrom', parseAsString);
    const [dateTo, setDateTo] = useQueryState('dateTo', parseAsString);
    const [states, setStates] = useQueryState('states', parseAsArrayOf(parseAsInteger).withDefault([]));
    const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('roi-desc'));

    const [localDateFrom, setLocalDateFrom] = useState<Date | undefined>(
        dateFrom ? new Date(dateFrom) : undefined
    );
    const [localDateTo, setLocalDateTo] = useState<Date | undefined>(
        dateTo ? new Date(dateTo) : undefined
    );

    // Sync filters to parent
    useEffect(() => {
        onFiltersChange({
            creditScoreMin,
            creditScoreMax,
            faceValueMin,
            faceValueMax,
            dateFrom: localDateFrom,
            dateTo: localDateTo,
            states: states as InvoiceState[],
            sortBy,
        });
    }, [creditScoreMin, creditScoreMax, faceValueMin, faceValueMax, localDateFrom, localDateTo, states, sortBy, onFiltersChange]);

    const handleDateFromChange = (date: Date | undefined) => {
        setLocalDateFrom(date);
        setDateFrom(date ? date.toISOString() : null);
    };

    const handleDateToChange = (date: Date | undefined) => {
        setLocalDateTo(date);
        setDateTo(date ? date.toISOString() : null);
    };

    const handleStateToggle = (state: InvoiceState) => {
        const newStates = states.includes(state)
            ? states.filter((s) => s !== state)
            : [...states, state];
        setStates(newStates);
    };

    const clearAllFilters = () => {
        setCreditScoreMin(300);
        setCreditScoreMax(850);
        setFaceValueMin(0);
        setFaceValueMax(maxFaceValue);
        setLocalDateFrom(undefined);
        setLocalDateTo(undefined);
        setDateFrom(null);
        setDateTo(null);
        setStates([]);
        setSortBy('roi-desc');
    };

    const activeFilterCount =
        (creditScoreMin !== 300 ? 1 : 0) +
        (creditScoreMax !== 850 ? 1 : 0) +
        (faceValueMin !== 0 ? 1 : 0) +
        (faceValueMax !== maxFaceValue ? 1 : 0) +
        (localDateFrom ? 1 : 0) +
        (localDateTo ? 1 : 0) +
        states.length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Credit Score Range</Label>
                                    <Slider
                                        min={300}
                                        max={850}
                                        step={10}
                                        value={[creditScoreMin, creditScoreMax]}
                                        onValueChange={([min, max]) => {
                                            setCreditScoreMin(min);
                                            setCreditScoreMax(max);
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{creditScoreMin}</span>
                                        <span>{creditScoreMax}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Face Value Range (CTC)</Label>
                                    <Slider
                                        min={0}
                                        max={maxFaceValue}
                                        step={100}
                                        value={[faceValueMin, faceValueMax]}
                                        onValueChange={([min, max]) => {
                                            setFaceValueMin(min);
                                            setFaceValueMax(max);
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{formatCurrency(faceValueMin)}</span>
                                        <span>{formatCurrency(faceValueMax)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Repayment Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {localDateFrom ? format(localDateFrom, 'PP') : 'From'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={localDateFrom}
                                                    onSelect={handleDateFromChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {localDateTo ? format(localDateTo, 'PP') : 'To'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={localDateTo}
                                                    onSelect={handleDateToChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Invoice State</Label>
                                    <div className="space-y-2">
                                        {STATE_OPTIONS.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`state-${option.value}`}
                                                    checked={states.includes(option.value)}
                                                    onCheckedChange={() => handleStateToggle(option.value)}
                                                />
                                                <label
                                                    htmlFor={`state-${option.value}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Filter Badges */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {creditScoreMin !== 300 && (
                        <Badge variant="secondary" className="gap-1">
                            Credit ≥ {creditScoreMin}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setCreditScoreMin(300)}
                            />
                        </Badge>
                    )}
                    {creditScoreMax !== 850 && (
                        <Badge variant="secondary" className="gap-1">
                            Credit ≤ {creditScoreMax}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setCreditScoreMax(850)}
                            />
                        </Badge>
                    )}
                    {faceValueMin !== 0 && (
                        <Badge variant="secondary" className="gap-1">
                            Value ≥ {formatCurrency(faceValueMin)}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setFaceValueMin(0)}
                            />
                        </Badge>
                    )}
                    {faceValueMax !== maxFaceValue && (
                        <Badge variant="secondary" className="gap-1">
                            Value ≤ {formatCurrency(faceValueMax)}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setFaceValueMax(maxFaceValue)}
                            />
                        </Badge>
                    )}
                    {localDateFrom && (
                        <Badge variant="secondary" className="gap-1">
                            From {format(localDateFrom, 'PP')}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleDateFromChange(undefined)}
                            />
                        </Badge>
                    )}
                    {localDateTo && (
                        <Badge variant="secondary" className="gap-1">
                            To {format(localDateTo, 'PP')}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleDateToChange(undefined)}
                            />
                        </Badge>
                    )}
                    {states.map((state) => (
                        <Badge key={state} variant="secondary" className="gap-1">
                            {STATE_OPTIONS.find((o) => o.value === state)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleStateToggle(state)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
