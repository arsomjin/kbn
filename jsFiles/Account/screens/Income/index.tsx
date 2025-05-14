import React, {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  ForwardedRef,
} from "react";
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  FormSelect,
} from "shards-react";
import { isMobile } from "react-device-detect";
import ReactTable from "react-table-6";
import PageTitle from "components/common/PageTitle";
import { FirebaseContext } from "../../../../firebase";
import { showWarn } from "functions";
import { useSelector } from "react-redux";
import { arrayForEach } from "functions";
import OverlaySlideComponent from "elements/OverlaySlideComponent";
import IncomeDaily from "./IncomeDaily";
import { h } from "api";
import { sortArr } from "functions";
import {
  IncomeVehicleColumns,
  IncomeServiceColumns,
  IncomePartColumns, 
  IncomeOtherColumns,
  getFilterData,
} from "Modules/Account/api";
import { AccountSkeleton } from "components/skeletons";
import moment from "moment";
import { DateRange } from "data/Constant";
import RangeDatePicker from "components/common/RangeDatePicker";
import { Fade } from "react-awesome-reveal";
import { IncomeDailyCategories } from "data/Constant";

/**
 * Interface for income item
 */
interface IncomeItem {
  [key: string]: any;
}

/**
 * Interface for income order/record
 */
interface IncomeOrder {
  id?: number;
  _key?: string;
  date?: string;
  branchCode?: string;
  incomeVehicleId?: string;
  orderServiceId?: string;
  orderPartId?: string;
  orderOtherId?: string;
  orderId?: string;
  firstName?: string;
  lastName?: string;
  prefix?: string;
  total?: number;
  status?: string;
  items?: IncomeItem[];
  [key: string]: any;
}

/**
 * Interface for Firebase document snapshot
 */
interface DocumentSnapshot {
  id: string;
  data: () => any;
}

/**
 * Interface for Firebase collection snapshot changes
 */
interface DocChange {
  type: "added" | "modified" | "removed";
  doc: {
    id: string;
    data: () => any;
  };
}

/**
 * Props interface for Income component
 */
interface IncomeProps {
  [key: string]: any;
}

/**
 * Income component that manages all income data and filtering
 */
const Income = forwardRef((props: IncomeProps, ref: ForwardedRef<any>) => {
  const { user } = useSelector((state: any) => state.auth);
  const { branches, giveaways, equipmentLists } = useSelector(
    (state: any) => state.data
  );
  const { firestore, api } = useContext(FirebaseContext);

  const grant: boolean = true;
  // user.isDev || (user.permissions && user.permissions.permission202)

  const [incomeVehicles, setOrderVehicles] = useState<IncomeOrder[]>([]);
  const [orderServices, setOrderServices] = useState<IncomeOrder[]>([]);
  const [orderParts, setOrderParts] = useState<IncomeOrder[]>([]);
  const [orderOthers, setOrderOthers] = useState<IncomeOrder[]>([]);
  const [ready, setReady] = useState<number>(0);
  const [showOrder, setShowOrder] = useState<boolean>(false);
  const [range, setRange] = useState<string>(DateRange.today);
  const [selectedOrder, setSelectedOrder] = useState<IncomeOrder>({});
  const [readOnly, setReadOnly] = useState<boolean>(!grant);
  const [branchCode, setBranch] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>(IncomeDailyCategories.vehicles);

  /**
   * Fetch income vehicle items by ID
   */
  const getOrderItems = (itemId: string): Promise<IncomeItem[]> =>
    new Promise(async (r, j) => {
      let items: IncomeItem[] = [];
      try {
        const cSnap = await firestore
          .collection("incomeVehicleItems")
          .where("incomeVehicleId", "==", itemId)
          .get();
        
        if (cSnap.empty) {
          showWarn("No document");
          return r(items);
        }
        
        cSnap.forEach((doc: DocumentSnapshot) => {
          let item = doc.data();
          items.push(item);
        });
        
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    });

  /**
   * Get all income vehicle records with real-time updates
   */
  const getOrderVehicles = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let incomeVehicleRef = firestore.collection("incomeVehicles");
    
    return incomeVehicleRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn("No document");
        setOrderVehicles(orders);
        setReady((rd) => rd + 1);
        return;
      }
      
      cSnap.docChanges().forEach((change: DocChange) => {
        let incomeVehicle = change.doc.data();
        incomeVehicle._key = change.doc.id;
        
        if (change.type === "added") {
          orders.push(incomeVehicle);
        }
        
        if (change.type === "modified") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = incomeVehicle;
          }
        }
        
        if (change.type === "removed") {
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

      mOrders = sortArr(mOrders, "-date");
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderVehicles(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  /**
   * Fetch order service items by ID
   */
  const getOrderServiceItems = (itemId: string): Promise<IncomeItem[]> =>
    new Promise(async (r, j) => {
      let items: IncomeItem[] = [];
      try {
        const cSnap = await firestore
          .collection("orderServiceItems")
          .where("orderServiceId", "==", itemId)
          .get();
        
        if (cSnap.empty) {
          showWarn("No document");
          return r(items);
        }
        
        cSnap.forEach((doc: DocumentSnapshot) => {
          let item = doc.data();
          items.push(item);
        });
        
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    });

  /**
   * Get all service orders with real-time updates
   */
  const getOrderService = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderServiceRef = firestore.collection("orderServices");
    
    return orderServiceRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn("No document");
        setOrderServices(orders);
        setReady((rd) => rd + 1);
        return;
      }
      
      cSnap.docChanges().forEach((change: DocChange) => {
        let orderService = change.doc.data();
        orderService._key = change.doc.id;
        
        if (change.type === "added") {
          orders.push(orderService);
        }
        
        if (change.type === "modified") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderService;
          }
        }
        
        if (change.type === "removed") {
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

      mOrders = sortArr(mOrders, "-date");
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderServices(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  /**
   * Get all part orders with real-time updates
   */
  const getOrderPart = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderPartRef = firestore.collection("orderParts");
    
    return orderPartRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn("No document");
        setOrderParts(orders);
        setReady((rd) => rd + 1);
        return;
      }
      
      cSnap.docChanges().forEach((change: DocChange) => {
        let orderPart = change.doc.data();
        orderPart._key = change.doc.id;
        
        if (change.type === "added") {
          orders.push(orderPart);
        }
        
        if (change.type === "modified") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderPart;
          }
        }
        
        if (change.type === "removed") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      
      mOrders = sortArr(mOrders, "-date");
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderParts(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  /**
   * Get all other orders with real-time updates
   */
  const getOrderOther = useCallback(() => {
    let orders: IncomeOrder[] = [];
    let orderOtherRef = firestore.collection("orderOthers");
    
    return orderOtherRef.onSnapshot(async (cSnap: any) => {
      if (cSnap.empty) {
        showWarn("No document");
        setOrderOthers(orders);
        setReady((rd) => rd + 1);
        return;
      }
      
      cSnap.docChanges().forEach((change: DocChange) => {
        let orderOther = change.doc.data();
        orderOther._key = change.doc.id;
        
        if (change.type === "added") {
          orders.push(orderOther);
        }
        
        if (change.type === "modified") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderOther;
          }
        }
        
        if (change.type === "removed") {
          const oId = orders.findIndex((l) => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      
      mOrders = sortArr(mOrders, "-date");
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderOthers(mOrders);
      setReady((rd) => rd + 1);
    });
  }, [firestore]);

  // Load data when component mounts
  useEffect(() => {
    // Get Income data
    const unsubscribeVehicles = getOrderVehicles();
    const unsubscribeServices = getOrderService();
    const unsubscribeParts = getOrderPart();
    const unsubscribeOthers = getOrderOther();
    
    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeVehicles && unsubscribeVehicles();
      unsubscribeServices && unsubscribeServices();
      unsubscribeParts && unsubscribeParts();
      unsubscribeOthers && unsubscribeOthers();
    };
  }, [getOrderService, getOrderVehicles, getOrderPart, getOrderOther]);

  // Load giveaways if not already loaded
  useEffect(() => {
    if (Object.keys(giveaways).length === 0) {
      api.getGiveaways();
    }
  }, [api, giveaways]);

  /**
   * Handle item view details 
   */
  const handleItemViewDetails = useCallback((item: IncomeOrder, cate: string) => {
    setSelectedOrder(item);
    setCategory(cate);
    setShowOrder(true);
  }, []);

  /**
   * Handle start date selection
   */
  const _onStartDateSelected = useCallback((dateValue: Date) => {
    setStartDate(dateValue);
  }, []);

  /**
   * Handle end date selection
   */
  const _onEndDateSelected = useCallback((dateValue: Date) => {
    setEndDate(dateValue);
  }, []);

  /**
   * Handle branch selection
   */
  const _onBranchSelected = (br: string) => setBranch(br);

  /**
   * Create a new order
   */
  const _addNewOrder = useCallback(() => {
    const lastNo = parseInt(Math.floor(Math.random() * 10000).toString());
    const padLastNo = ("0".repeat(3) + lastNo).slice(-5);
    const orderId = `INV-VH${moment().format("YYYYMMDD")}${padLastNo}`;
    setSelectedOrder({ orderId });
    setShowOrder(true);
  }, []);

  // Filter data based on selected branch and date range
  const VechicleOrderData = getFilterData({
    data: incomeVehicles,
    branchCode,
    range,
    startDate,
    endDate,
  });

  const ServiceOrderData = getFilterData({
    data: orderServices,
    branchCode,
    range,
    startDate,
    endDate,
  });

  const PartOrderData = getFilterData({
    data: orderParts,
    branchCode,
    range,
    startDate,
    endDate,
  });

  const OtherOrderData = getFilterData({
    data: orderOthers,
    branchCode,
    range,
    startDate,
    endDate,
  });

  /**
   * Render the card header with filtering options
   */
  const renderCardHeader = () => (
    <CardHeader>
      <Row style={{ alignItems: "center" }}>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect
            name="branchCode"
            value={branchCode}
            onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => 
              _onBranchSelected(ev.target.value)
            }
            disabled={!grant}
          >
            {[
              <option key="all" value="all">
                ทุกสาขา
              </option>,
              ...Object.keys(branches).map((key) => (
                <option key={key} value={key}>
                  {branches[key].branchName}
                </option>
              )),
            ]}
          </FormSelect>
        </Col>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect
            name="range"
            value={range}
            onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => 
              setRange(ev.target.value)
            }
            disabled={!grant}
          >
            <option value={DateRange.today}>{DateRange.today}</option>
            <option value={DateRange.thisWeek}>{DateRange.thisWeek}</option>
            <option value={DateRange.thisMonth}>{DateRange.thisMonth}</option>
            <option value={DateRange.sevenDays}>{DateRange.sevenDays}</option>
            <option value={DateRange.thirtyDays}>{DateRange.thirtyDays}</option>
            <option value={DateRange.custom}>{DateRange.custom}</option>
          </FormSelect>
        </Col>
        {range === DateRange.custom ? (
          <Col md="4" className="mt-2">
            <RangeDatePicker
              onStartDateChange={_onStartDateSelected}
              onEndDateChange={_onEndDateSelected}
            />
          </Col>
        ) : (
          <Col md="4" />
        )}
      </Row>
    </CardHeader>
  );

  /**
   * Render vehicle orders table
   */
  const renderOrderVehicles = () => (
    <CardBody>
      {VechicleOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={VechicleOrderData}
            columns={IncomeVehicleColumns(
              grant,
              handleItemViewDetails,
              branches
            )}
            rowKey="id"
            pageSize={
              VechicleOrderData.length < 21 ? VechicleOrderData.length : 20
            }
            resizable
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div
          className="d-flex border p-2"
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  /**
   * Render service orders table
   */
  const renderOrderService = () => (
    <CardBody>
      {ServiceOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={ServiceOrderData}
            columns={IncomeServiceColumns(
              grant,
              handleItemViewDetails,
              branches
            )}
            rowKey="id"
            pageSize={
              ServiceOrderData.length < 21 ? ServiceOrderData.length : 20
            }
            resizable
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div
          className="d-flex border p-2"
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  /**
   * Render part orders table
   */
  const renderOrderPart = () => (
    <CardBody>
      {PartOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={PartOrderData}
            columns={IncomePartColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={PartOrderData.length < 21 ? PartOrderData.length : 20}
            resizable={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div
          className="d-flex border p-2"
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  /**
   * Render other orders table
   */
  const renderOrderOther = () => (
    <CardBody>
      {OtherOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={OtherOrderData}
            columns={IncomeOtherColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={OtherOrderData.length < 21 ? OtherOrderData.length : 20}
            resizable={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div
          className="d-flex border p-2"
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  const hasOrder =
    incomeVehicles.length === 0 &&
    orderServices.length === 0 &&
    orderParts.length === 0 &&
    orderOthers.length === 0;

  return (
    <Container
      fluid
      className="main-content-container px-4 pb-4"
      style={{ height: showOrder ? 2000 : h(80) }}
    >
      <Row
        noGutters
        className="page-header py-4"
        style={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <PageTitle
          sm="4"
          title="รายรับ"
          subtitle="บัญชี"
          className="text-sm-left"
        />
      </Row>
      {ready < 3 ? (
        <AccountSkeleton />
      ) : hasOrder ? (
        <div className="error">
          <div className="error__content">
            <i
              className="material-icons"
              style={{ fontSize: 58, color: "lightgray", marginBottom: 10 }}
            >
              remove_from_queue
            </i>

            {isMobile ? (
              <h5 style={{ fontFamily: "sans-serif", color: "lightgrey" }}>
                ไม่มีรายการ
              </h5>
            ) : (
              <h4 style={{ color: "lightgrey" }}>ไม่มีรายการ</h4>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Card small>
            {renderCardHeader()}
            <CardHeader className="border-bottom text-primary">
              รถและอุปกรณ์
            </CardHeader>
            {renderOrderVehicles()}
            <CardHeader className="border-bottom text-primary">
              งานบริการ
            </CardHeader>
            {renderOrderService()}
            <CardHeader className="border-bottom text-primary">
              อะไหล่
            </CardHeader>
            {renderOrderPart()}
            <CardHeader className="border-bottom text-primary">
              อื่นๆ
            </CardHeader>
            {renderOrderOther()}
          </Card>
        </div>
      )}

      <OverlaySlideComponent open={showOrder}>
        <IncomeDaily
          readOnly={readOnly}
          order={selectedOrder}
          onBack={() => setShowOrder(false)}
          category={category}
        />
      </OverlaySlideComponent>
    </Container>
  );
});

export default memo(Income);