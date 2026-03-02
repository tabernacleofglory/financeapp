
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInDays } from 'date-fns';

interface DateRangeContextState {
    dateRange: DateRange | undefined;
    setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
    getPreviousPeriod: (currentRange: DateRange) => DateRange;
}

const DateRangeContext = createContext<DateRangeContextState | undefined>(undefined);

const initialDateRange = (): DateRange => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - from.getDay());
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    to.setHours(23, 59, 59, 999);
    return { from, to };
};

export const DateRangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange());

    const getPreviousPeriod = (currentRange: DateRange): DateRange => {
        if (!currentRange.from || !currentRange.to) {
            // return a default to avoid crashing
            const from = addDays(new Date(), -13);
            const to = addDays(new Date(), -7);
            return { from, to };
        }
        const daysDifference = differenceInDays(currentRange.to, currentRange.from);
        const previousPeriodEnd = addDays(currentRange.from, -1);
        const previousPeriodStart = addDays(previousPeriodEnd, -daysDifference);
        return { from: previousPeriodStart, to: previousPeriodEnd };
    }

    return (
        <DateRangeContext.Provider value={{ dateRange, setDateRange, getPreviousPeriod }}>
            {children}
        </DateRangeContext.Provider>
    );
};

export const useDateRange = (): DateRangeContextState => {
    const context = useContext(DateRangeContext);
    if (context === undefined) {
        throw new Error('useDateRange must be used within a DateRangeProvider');
    }
    return context;
};
