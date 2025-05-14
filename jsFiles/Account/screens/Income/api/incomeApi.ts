import { sortArr } from 'functions';
import { showWarn } from 'functions';
import moment from 'moment';

// Define types for Income API
export interface OrderItem {
  [key: string]: any;
}

export interface IncomeOrder {
  _key: string;
  id?: number;
  date?: string;
  branchCode?: string;
  incomeVehicleId?: string;
  orderServiceId?: string;
  orderPartId?: string;
  orderOtherId?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  [key: string]: any;
}

export interface FirestoreQuery {
  where: (field: string, operator: string, value: any) => FirestoreQuery;
  get: () => Promise<FirestoreSnapshot>;
  onSnapshot: (callback: (snapshot: FirestoreSnapshot) => void) => () => void;
}

export interface FirestoreSnapshot {
  empty: boolean;
  docs?: Array<{
    id: string;
    ref: any;
    data: () => any;
  }>;
  docChanges: () => Array<{
    type: 'added' | 'modified' | 'removed';
    doc: {
      id: string;
      data: () => any;
    }
  }>;
  forEach: (callback: (doc: { id: string; data: () => any }) => void) => void;
}

export interface FirestoreInstance {
  collection: (path: string) => FirestoreQuery;
}

export interface FilterDataOptions {
  data: IncomeOrder[];
  branchCode: string;
  range: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Get vehicle income items by income ID
 * @param firestore - Firestore instance
 * @param incomeId - Income vehicle ID
 * @returns Promise with array of income items
 */
export const getIncomeVehicleItems = async (
  firestore: FirestoreInstance,
  incomeId: string
): Promise<OrderItem[]> => {
  let items: OrderItem[] = [];
  try {
    const cSnap = await firestore
      .collection('incomeVehicleItems')
      .where('incomeVehicleId', '==', incomeId)
      .get();
    
    if (cSnap.empty) {
      showWarn('No document');
      return items;
    }
    
    cSnap.forEach((doc: any) => {
      items.push(doc.data());
    });
    
    return items;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

/**
 * Get service order items by order ID
 * @param firestore - Firestore instance
 * @param orderId - Service order ID
 * @returns Promise with array of service items
 */
export const getServiceOrderItems = async (
  firestore: FirestoreInstance, 
  orderId: string
): Promise<OrderItem[]> => {
  let items: OrderItem[] = [];
  try {
    const cSnap = await firestore
      .collection('orderServiceItems')
      .where('orderServiceId', '==', orderId)
      .get();
    
    if (cSnap.empty) {
      showWarn('No document');
      return items;
    }
    
    cSnap.forEach((doc: any) => {
      let item = doc.data();
      items.push(item);
    });
    
    return items;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

/**
 * Filter income data based on branch, date range, etc.
 * @param options - Filter options
 * @returns Filtered income data
 */
export const filterIncomeData = (options: FilterDataOptions): IncomeOrder[] => {
  const { data, branchCode, range, startDate, endDate } = options;
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Filter by branch if not 'all'
  let filteredData = branchCode === 'all' 
    ? [...data]
    : data.filter(d => d.branchCode === branchCode);
    
  // Apply date range filter
  filteredData = filteredData.filter(d => {
    if (!d.date) return false;
    
    const itemDate = moment(d.date);
    
    switch (range) {
      case 'วันนี้':
        return itemDate.isSame(moment(), 'day');
      case 'สัปดาห์นี้':
        return itemDate.isSameOrAfter(moment().startOf('week'));
      case 'เดือนนี้':
        return itemDate.isSameOrAfter(moment().startOf('month'));
      case '7 วันล่าสุด':
        return itemDate.isSameOrAfter(moment().subtract(7, 'days'));
      case '30 วันล่าสุด':
        return itemDate.isSameOrAfter(moment().subtract(30, 'days'));
      case 'กำหนดเอง':
        return itemDate.isSameOrAfter(moment(startDate).startOf('day')) && 
               itemDate.isSameOrBefore(moment(endDate).endOf('day'));
      default:
        return true;
    }
  });
  
  return filteredData;
};

/**
 * Create a new random order ID
 * @param prefix - Order ID prefix
 * @returns New unique order ID
 */
export const createNewOrderId = (prefix: string = 'INV-VH'): string => {
  const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
  const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
  return `${prefix}${moment().format('YYYYMMDD')}${padLastNo}`;
};