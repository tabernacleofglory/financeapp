import type { FinancialRecord, Offering } from '@/lib/types';

export const financialRecords: FinancialRecord[] = [
  { id: '1', amount: 2500, category: 'Income', date: new Date('2023-01-15'), notes: 'Monthly Salary' },
  { id: '2', amount: -75.5, category: 'Expenses', date: new Date('2023-01-20'), notes: 'Groceries' },
  { id: '3', amount: -1200, category: 'Expenses', date: new Date('2023-02-01'), notes: 'Rent' },
  { id: '4', amount: 500, category: 'Income', date: new Date('2023-02-05'), notes: 'Freelance work' },
  { id: '5', amount: -200, category: 'Investments', date: new Date('2023-02-10'), notes: 'Stock market' },
  { id: '6', amount: 2500, category: 'Income', date: new Date('2023-02-15'), notes: 'Monthly Salary' },
  { id: '7', amount: 100, category: 'First Foots', date: new Date('2023-03-01'), notes: 'Gift' },
  { id: '8', amount: -1200, category: 'Expenses', date: new Date('2023-03-01'), notes: 'Rent' },
  { id: '9', amount: -50, category: 'Expenses', date: new Date('2023-03-05'), notes: 'Dinner out' },
  { id: '10', amount: 2500, category: 'Income', date: new Date('2023-03-15'), notes: 'Monthly Salary' },
  { id: '11', amount: -150, category: 'Savings', date: new Date('2023-03-25'), notes: 'Vacation fund' },
  { id: '12', amount: 150, category: 'First Foots', date: new Date('2023-04-01'), notes: 'Donation' },
];

export const offerings: Offering[] = [
    { id: '1', name: 'John Doe', amount: 100, type: 'Tithe', date: new Date('2023-01-07') },
    { id: '2', name: 'Jane Smith', amount: 50, type: 'General', date: new Date('2023-01-14') },
    { id: '3', name: 'Anonymous', amount: 200, type: 'Missions', date: new Date('2023-02-07') },
    { id: '4', name: 'Mike Johnson', amount: 150, type: 'Building Fund', date: new Date('2023-02-21') },
    { id: '5', name: 'Sarah Brown', amount: 120, type: 'Tithe', date: new Date('2023-03-07') },
];
