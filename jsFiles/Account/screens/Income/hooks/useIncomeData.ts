import { useCallback, useState, useEffect, useContext } from 'react';
import { sortArr } from 'functions';
import { showWarn } from 'functions';
import { arrayForEach } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { DateRange } from 'data/Constant';
import { IncomeDailyCategories } from 'data/Constant';
import moment from 'moment';
import { IncomeOrder, OrderItem } from '../api/incomeApi';

/**
 * Hook options for useIncomeData
 */
interface UseIncomeDataOptions {
  initialBranchCode?: string;
  initialRange?: string;
}

/**
 * Custom hook for fetching and managing income data
 */
export const useIncomeData = (options: UseIncomeDataOptions = {}) => {
  const { initialBranchCode = 'all', initialRange = DateRange.today } = options;
  const { firestore, api } = useContext(FirebaseContext);
  
  // State declarations
  const [incomeVehicles, setOrderVehicles] = useState<IncomeOrder[]>([]);
  const [orderServices, setOrderServices] = useState<IncomeOrder[]>([]);
  const [orderParts, setOrderParts] = useState<IncomeOrder[]>([]);
  const [orderOthers, setOrderOthers] = useState<IncomeOrder[]>([]);
  const [ready, setReady] = useState<number>(0);
  const [showOrder, setShowOrder] = useState<boolean>(false);
  const [range, setRange] = useState<string>(initialRange);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, any>>({});
  const [branchCode, setBranchCode] = useState<string>(initialBranchCode);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>(IncomeDailyCategories.vehicles);

  /**
   * Fetch items for a specific income vehicle
   */
  const getOrderItems = useCallback((itemId: string): Promise<OrderItem[]> => 
    new Promise(async (r, j) => {
      let items: OrderItem[] = [];
      try {
        const cSnap = await firestore
          .collection('incomeVehicleItems')
          .where('incomeVehicleId', '==', itemId)
          .get();
        if (cSnap.empty) {
          showWarn('No document');
          return r(items);
        }
        cSnap.forEach((doc: any) => {
          let item = doc.data();
          items.push(item);
        });
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    }),
  [firestore]);

  /**
   * Fetch service items for a specific order
   */
  const getOrderServiceItems = useCallback((itemId: string): Promise<OrderItem[]> => 
    new Promise(async (r, j) => {
      let items: OrderItem[] = [];
      try {
        const cSnap = await firestore
          .collection('orderServiceItems')
          .where('orderServiceId', '==', itemId)
          .get();
        if (cSnap.empty) {
          showWarn('No document');
          return r(items);
        }
        cSnap.forEach((doc: any) => {
          let item = doc.data();
          items.push(item);
        });
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    }),
  [firestore]);

  /**
   * Set up Firebase listener for vehicle income data
   */
  const getOrderVehicles = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let incomeVehicleRef = firestore.collection('incomeVehicles');
    return incomeVehicleRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderVehicles(orders);
        setReady((rd) => rd + 1);
        return;
      }
      cSnap.docChanges().forEach((change: any) => {
        let incomeVehicle = change.doc.data();
        incomeVehicle._key = change.doc.id;
        if (change.type === 'added') {
          orders.push(incomeVehicle);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = incomeVehicle;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      await arrayForEach(orders, async (order, id) => {
        if (order.incomeVehicleId) {
          const items = await getOrderItems(order.incomeVehicleId);
          mOrders[id].items = items;
        }
      });

      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderVehicles(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore, getOrderItems]);

  /**
   * Set up Firebase listener for service order data
   */
  const getOrderService = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderServiceRef = firestore.collection('orderServices');
    return orderServiceRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderServices(orders);
        setReady((rd) => rd + 1);
        return;
      }
      cSnap.docChanges().forEach((change: any) => {
        let orderService = change.doc.data();
        orderService._key = change.doc.id;
        if (change.type === 'added') {
          orders.push(orderService);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderService;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      await arrayForEach(orders, async (order, id) => {
        if (order.orderServiceId) {
          const items = await getOrderServiceItems(order.orderServiceId);
          mOrders[id].items = items;
        }
      });

      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderServices(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore, getOrderServiceItems]);

  /**
   * Set up Firebase listener for part order data
   */
  const getOrderPart = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderPartRef = firestore.collection('orderParts');
    return orderPartRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderParts(orders);
        setReady((rd) => rd + 1);
        return;
      }
      cSnap.docChanges().forEach((change: any) => {
        let orderPart = change.doc.data();
        orderPart._key = change.doc.id;
        if (change.type === 'added') {
          orders.push(orderPart);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderPart;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));

      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderParts(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  /**
   * Set up Firebase listener for other order data
   */
  const getOrderOther = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderOtherRef = firestore.collection('orderOthers');
    return orderOtherRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderOthers(orders);
        setReady((rd) => rd + 1);
        return;
      }
      cSnap.docChanges().forEach((change: any) => {
        let orderOther = change.doc.data();
        orderOther._key = change.doc.id;
        if (change.type === 'added') {
          orders.push(orderOther);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderOther;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));

      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderOthers(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  /**
   * Handle opening item details view
   */
  const handleItemViewDetails = useCallback((item: any, cate: string) => {
    setSelectedOrder(item);
    setCategory(cate);
    setShowOrder(true);
  }, []);

  /**
   * Create a new order ID
   */
  const createNewOrder = useCallback(() => {
    const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
    const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
    const orderId = `INV-VH${moment().format('YYYYMMDD')}${padLastNo}`;
    setSelectedOrder({ orderId });
    setShowOrder(true);
  }, []);

  /**
   * Filter data based on branch and date range
   */
  const filterData = useCallback((data: IncomeOrder[]) => {
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
        case DateRange.today:
          return itemDate.isSame(moment(), 'day');
        case DateRange.thisWeek:
          return itemDate.isSameOrAfter(moment().startOf('week'));
        case DateRange.thisMonth:
          return itemDate.isSameOrAfter(moment().startOf('month'));
        case DateRange.sevenDays:
          return itemDate.isSameOrAfter(moment().subtract(7, 'days'));
        case DateRange.thirtyDays:
          return itemDate.isSameOrAfter(moment().subtract(30, 'days'));
        case DateRange.custom:
          return itemDate.isSameOrAfter(moment(startDate).startOf('day')) && 
                itemDate.isSameOrBefore(moment(endDate).endOf('day'));
        default:
          return true;
      }
    });
    
    return filteredData;
  }, [branchCode, range, startDate, endDate]);

  // Set up Firebase listeners on initial render
  useEffect(() => {
    const unsubscribeVehicles = getOrderVehicles();
    const unsubscribeServices = getOrderService();
    const unsubscribeParts = getOrderPart();
    const unsubscribeOthers = getOrderOther();
    
    return () => {
      unsubscribeVehicles && unsubscribeVehicles();
      unsubscribeServices && unsubscribeServices();
      unsubscribeParts && unsubscribeParts();
      unsubscribeOthers && unsubscribeOthers();
    };
  }, [getOrderService, getOrderVehicles, getOrderPart, getOrderOther]);

  // Fetch giveaways data if needed
  useEffect(() => {
    const { getGiveaways } = api || {};
    if (getGiveaways && typeof getGiveaways === 'function') {
      getGiveaways();
    }
  }, [api]);

  // Apply filters to data
  const filteredVehicleData = filterData(incomeVehicles);
  const filteredServiceData = filterData(orderServices);
  const filteredPartData = filterData(orderParts);
  const filteredOtherData = filterData(orderOthers);

  // Check if there's any data
  const hasNoOrders = 
    incomeVehicles.length === 0 &&
    orderServices.length === 0 &&
    orderParts.length === 0 &&
    orderOthers.length === 0;

  return {
    // State
    incomeVehicles: filteredVehicleData,
    orderServices: filteredServiceData,
    orderParts: filteredPartData,
    orderOthers: filteredOtherData,
    ready,
    showOrder,
    range,
    selectedOrder,
    branchCode,
    startDate,
    endDate,
    category,
    hasNoOrders,
    
    // Setters
    setBranchCode,
    setRange,
    setStartDate,
    setEndDate,
    setShowOrder,
    
    // Actions
    handleItemViewDetails,
    createNewOrder
  };
};