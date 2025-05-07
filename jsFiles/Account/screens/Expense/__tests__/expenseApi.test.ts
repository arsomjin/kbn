import { 
  getExpensesByDate, 
  getExpensesByRange, 
  getExpenseItems,
  checkExistingExpense,
  FirestoreInstance,
  FirestoreSnapshot
} from '../api/expenseApi';
import { DateRange } from 'data/Constant';
import moment from 'moment';

// Mock dependencies
jest.mock('firebase/api', () => ({
  checkCollection: jest.fn()
}));

jest.mock('functions', () => ({
  showWarn: jest.fn(),
  showLog: jest.fn(),
  sortArr: jest.fn(arr => arr)
}));

const createMockFirestore = (mockSnapshot: Partial<FirestoreSnapshot>) => {
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue(mockSnapshot)
  };
  
  return {
    collection: jest.fn().mockReturnValue(mockQuery),
    runTransaction: jest.fn()
  } as unknown as FirestoreInstance;
};

describe('Expense API', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpensesByDate', () => {
    it('should return an empty array when no documents found', async () => {
      // Mock empty snapshot
      const mockFirestore = createMockFirestore({
        empty: true,
        forEach: jest.fn()
      });

      const result = await getExpensesByDate(
        mockFirestore, 
        'BR001', 
        '2023-01-01', 
        'dailyChange'
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return formatted expenses when documents are found', async () => {
      // Mock snapshot with data
      const mockExpense = { id: '123', total: 500 };
      const mockSnapshot = {
        empty: false,
        forEach: jest.fn(callback => {
          callback({
            id: '123',
            data: () => mockExpense
          });
        })
      };
      const mockFirestore = createMockFirestore(mockSnapshot);

      const result = await getExpensesByDate(
        mockFirestore, 
        'BR001', 
        '2023-01-01', 
        'dailyChange'
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1); // Should be mapped to id + 1
      expect(result[0]._key).toBe('123');
      expect(result[0].key).toBe('123');
    });
  });

  describe('getExpensesByRange', () => {
    it('should properly handle date ranges', async () => {
      // Mock snapshot with data
      const mockExpense = { id: '123', total: 500 };
      const mockSnapshot = {
        empty: false,
        forEach: jest.fn(callback => {
          callback({
            id: '123',
            data: () => mockExpense
          });
        })
      };
      const mockFirestore = createMockFirestore(mockSnapshot);
      
      // Test with today range
      await getExpensesByRange(
        mockFirestore,
        'BR001',
        DateRange.today,
        '',
        '',
        'dailyChange'
      );
      
      // Verify where clause was called with today's date
      expect(mockFirestore.collection().where).toHaveBeenCalledWith(
        'date',
        '==',
        moment().format('YYYY-MM-DD')
      );

      // Reset where calls
      jest.clearAllMocks();
      
      // Test with custom range
      await getExpensesByRange(
        mockFirestore,
        'BR001',
        DateRange.custom,
        '2023-01-01',
        '2023-01-31',
        'dailyChange'
      );
      
      // Verify where clauses were called with custom range dates
      expect(mockFirestore.collection().where).toHaveBeenCalledWith(
        'date',
        '>=',
        moment('2023-01-01').format('YYYY-MM-DD')
      );
      expect(mockFirestore.collection().where).toHaveBeenCalledWith(
        'date',
        '<=',
        moment('2023-01-31').format('YYYY-MM-DD')
      );
    });
  });
});