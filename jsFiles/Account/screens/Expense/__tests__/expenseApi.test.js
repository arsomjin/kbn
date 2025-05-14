import { getExpensesByDate } from '../api/expenseApi';

// Mock dependencies
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  where: jest.fn(() => mockFirestore),
  get: jest.fn(async () => ({
    empty: true,
    forEach: jest.fn(),
  })),
};

describe('getExpensesByDate', () => {
  it('returns an empty array if no documents found', async () => {
    const result = await getExpensesByDate(mockFirestore, 'BR1', '2023-01-01', 'daily', undefined);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
