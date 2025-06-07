import React, { forwardRef, memo, useCallback, useContext, useEffect, useState } from 'react';
import { Container, Card, CardBody, CardHeader, Row, Col, FormSelect } from 'shards-react';
import { isMobile } from 'react-device-detect';
import ReactTable from 'react-table-6';
// import { useHistory, useLocation } from 'react-router-dom';
import PageTitle from 'components/common/PageTitle';
import { FirebaseContext } from '../../../../firebase';
import { showWarn } from 'functions';
import { useSelector } from 'react-redux';
import { arrayForEach } from 'functions';
import OverlaySlideComponent from 'elements/OverlaySlideComponent';
import IncomeDaily from './IncomeDaily';
import { h } from 'api';
import { sortArr } from 'functions';
import { IncomeVehicleColumns, IncomeServiceColumns } from 'Modules/Account/api';
import { AccountSkeleton } from 'components/skeletons';
import moment from 'moment';
import { DateRange } from 'data/Constant';
import RangeDatePicker from 'components/common/RangeDatePicker';
import { Fade } from 'react-awesome-reveal';
import { getFilterData } from 'Modules/Account/api';
import { IncomeDailyCategories } from 'data/Constant';
import { IncomePartColumns, IncomeOtherColumns } from 'Modules/Account/api';
import { PermissionGate, GeographicBranchSelector } from 'components';
import { usePermissions } from 'hooks/usePermissions';

const Income = forwardRef((props, ref) => {
  const { user } = useSelector(state => state.auth);
  const { branches, giveaways, equipmentLists } = useSelector(state => state.data);
  const { firestore, api } = useContext(FirebaseContext);
  const { filterDataByUserAccess, hasPermission, getAccessibleBranches } = usePermissions();
  // const history = useHistory();

  const grant = hasPermission('accounting.view');
  // Preserve existing logic while adding RBAC check
  const originalGrant = true; // user.isDev || (user.permissions && user.permissions.permission202);

  const [incomeVehicles, setOrderVehicles] = useState([]);
  const [orderServices, setOrderServices] = useState([]);
  const [orderParts, setOrderParts] = useState([]);
  const [orderOthers, setOrderOthers] = useState([]);
  const [ready, setReady] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [range, setRange] = useState(DateRange.today);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [readOnly, setReadOnly] = useState(!grant);
  const [branchCode, setBranch] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [category, setCategory] = useState(IncomeDailyCategories.vehicles);

  const getOrderItems = itemId =>
    new Promise(async (r, j) => {
      let items = [];
      try {
        const cSnap = await firestore.collection('incomeVehicleItems').where('incomeVehicleId', '==', itemId).get();
        //  showLog('itemSnap', cSnap);
        if (cSnap.empty) {
          showWarn('No document');
          return r(items);
        }
        cSnap.forEach(doc => {
          //  showLog('item', doc.data());
          let item = doc.data();
          items.push(item);
        });
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    });

  const getOrderVehicles = useCallback(() => {
    let orders = [];
    let incomeVehicleRef = firestore.collection('incomeVehicles');
    // let cSnap = await incomeVehicleRef.get();
    return incomeVehicleRef.onSnapshot(async cSnap => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderVehicles(orders);
        setReady(rd => rd + 1);
        return;
      }
      cSnap.docChanges().forEach(change => {
        let incomeVehicle = change.doc.data();
        incomeVehicle._key = change.doc.id;
        if (change.type === 'added') {
          // orders[doc.id] = incomeVehicle;
          orders.push(incomeVehicle);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = incomeVehicle;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
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

      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderVehicles(mOrders);
      setReady(rd => rd + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const getOrderServiceItems = itemId =>
    new Promise(async (r, j) => {
      let items = [];
      try {
        const cSnap = await firestore.collection('orderServiceItems').where('orderServiceId', '==', itemId).get();
        //  showLog('itemSnap', cSnap);
        if (cSnap.empty) {
          showWarn('No document');
          return r(items);
        }
        cSnap.forEach(doc => {
          //  showLog('item', doc.data());
          let item = doc.data();
          items.push(item);
        });
        r(items);
      } catch (e) {
        showWarn(e);
        j(e);
      }
    });

  const getOrderService = useCallback(() => {
    let orders = [];
    let orderServiceRef = firestore.collection('orderServices');
    // let cSnap = await orderServiceRef.get();
    return orderServiceRef.onSnapshot(async cSnap => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderServices(orders);
        setReady(rd => rd + 1);
        return;
      }
      cSnap.docChanges().forEach(change => {
        let orderService = change.doc.data();
        orderService._key = change.doc.id;
        if (change.type === 'added') {
          // orders[doc.id] = orderService;
          orders.push(orderService);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderService;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
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

      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderServices(mOrders);
      setReady(rd => rd + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const getOrderPart = useCallback(() => {
    let orders = [];
    let orderPartRef = firestore.collection('orderParts');
    // let cSnap = await orderPartRef.get();
    return orderPartRef.onSnapshot(async cSnap => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderParts(orders);
        setReady(rd => rd + 1);
        return;
      }
      cSnap.docChanges().forEach(change => {
        let orderPart = change.doc.data();
        orderPart._key = change.doc.id;
        if (change.type === 'added') {
          // orders[doc.id] = orderPart;
          orders.push(orderPart);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderPart;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderParts(mOrders);
      setReady(rd => rd + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const getOrderOther = useCallback(() => {
    let orders = [];
    let orderOtherRef = firestore.collection('orderOthers');
    // let cSnap = await orderOtherRef.get();
    return orderOtherRef.onSnapshot(async cSnap => {
      if (cSnap.empty) {
        showWarn('No document');
        setOrderOthers(orders);
        setReady(rd => rd + 1);
        return;
      }
      cSnap.docChanges().forEach(change => {
        let orderOther = change.doc.data();
        orderOther._key = change.doc.id;
        if (change.type === 'added') {
          // orders[doc.id] = orderOther;
          orders.push(orderOther);
        }
        if (change.type === 'modified') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          if (oId !== -1) {
            orders[oId] = orderOther;
          }
        }
        if (change.type === 'removed') {
          const oId = orders.findIndex(l => l._key === change.doc.id);
          orders.splice(oId, 1);
        }
      });
      orders = orders.map((order, id) => ({ ...order, id: id + 1 }));
      let mOrders = JSON.parse(JSON.stringify(orders));
      //  showLog('mOrders', mOrders);
      mOrders = sortArr(mOrders, '-date');
      mOrders = mOrders.map((od, id) => ({ ...od, id: id + 1 }));
      setOrderOthers(mOrders);
      setReady(rd => rd + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  useEffect(() => {
    // Get Income data.
    getOrderVehicles();
    getOrderService();
    getOrderPart();
    getOrderOther();
    return () => {
      getOrderVehicles();
      getOrderService();
      getOrderPart();
      getOrderOther();
    };
  }, [getOrderService, getOrderVehicles, getOrderPart, getOrderOther]);

  useEffect(() => {
    if (Object.keys(giveaways).length === 0) {
      api.getGiveaways();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemViewDetails = useCallback((item, cate) => {
    //  showLog({ item, cate });
    setSelectedOrder(item);
    setCategory(cate);
    setShowOrder(true);
  }, []);

  const _onStartDateSelected = useCallback(dateValue => {
    //  showLog('startDate', dateValue);
    setStartDate(dateValue);
  }, []);

  const _onEndDateSelected = useCallback(dateValue => {
    //  showLog('endDate', dateValue);
    setEndDate(dateValue);
  }, []);

  const _onBranchSelected = br => setBranch(br);

  const _addNewOrder = useCallback(() => {
    const lastNo = parseInt(Math.floor(Math.random() * 10000));
    const padLastNo = ('0'.repeat(3) + lastNo).slice(-5);
    const orderId = `INV-VH${moment().format('YYYYMMDD')}${padLastNo}`;
    //  showLog('orderId', orderId);
    setSelectedOrder({ orderId });
    setShowOrder(true);
  }, []);

  const VechicleOrderData = getFilterData({
    data: incomeVehicles,
    branchCode,
    range,
    startDate,
    endDate
  });

  const ServiceOrderData = getFilterData({
    data: orderServices,
    branchCode,
    range,
    startDate,
    endDate
  });

  const PartOrderData = getFilterData({
    data: orderParts,
    branchCode,
    range,
    startDate,
    endDate
  });

  const OtherOrderData = getFilterData({
    data: orderOthers,
    branchCode,
    range,
    startDate,
    endDate
  });

  const renderCardHeader = () => (
    <CardHeader>
      <Row style={{ alignItems: 'center' }}>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect
            name="branchCode"
            value={branchCode}
            onChange={ev => _onBranchSelected(ev.target.value)}
            disabled={!grant}
          >
            {[
              <option key="all" value="all">
                ทุกสาขา
              </option>,
              ...Object.keys(getAccessibleBranches(branches)).map(key => (
                <option key={key} value={key}>
                  {branches[key].branchName}
                </option>
              ))
            ]}
          </FormSelect>
        </Col>
        <Col md="4" className="mb-sm-0 mt-2">
          <FormSelect name="range" value={range} onChange={ev => setRange(ev.target.value)} disabled={!grant}>
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
            <RangeDatePicker onStartDateChange={_onStartDateSelected} onEndDateChange={_onEndDateSelected} />
          </Col>
        ) : (
          <Col md="4" />
        )}
      </Row>
    </CardHeader>
  );

  const renderOrderVehicles = () => (
    <CardBody>
      {VechicleOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={VechicleOrderData}
            columns={IncomeVehicleColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={VechicleOrderData.length < 21 ? VechicleOrderData.length : 20}
            // showPageSizeOptions={false}
            // resizable={false}
            resizable
            // showPagination={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div className="d-flex border p-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  const renderOrderService = () => (
    <CardBody>
      {ServiceOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={ServiceOrderData}
            columns={IncomeServiceColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={ServiceOrderData.length < 21 ? ServiceOrderData.length : 20}
            // showPageSizeOptions={false}
            // resizable={false}
            resizable
            // showPagination={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div className="d-flex border p-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  const renderOrderPart = () => (
    <CardBody>
      {PartOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={PartOrderData}
            columns={IncomePartColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={PartOrderData.length < 21 ? PartOrderData.length : 20}
            // showPageSizeOptions={false}
            resizable={false}
            // showPagination={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div className="d-flex border p-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  const renderOrderOther = () => (
    <CardBody>
      {OtherOrderData.length > 0 ? (
        <Fade direction="up" duration={500}>
          <ReactTable
            data={OtherOrderData}
            columns={IncomeOtherColumns(grant, handleItemViewDetails, branches)}
            rowKey="id"
            pageSize={OtherOrderData.length < 21 ? OtherOrderData.length : 20}
            // showPageSizeOptions={false}
            resizable={false}
            // showPagination={false}
            className="border-bottom mb-2"
          />
        </Fade>
      ) : (
        <div className="d-flex border p-2" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <i className="text-light">ไม่มีข้อมูล</i>
        </div>
      )}
    </CardBody>
  );

  const hasOrder =
    incomeVehicles.length === 0 && orderServices.length === 0 && orderParts.length === 0 && orderOthers.length === 0;

  return (
    <Container fluid className="main-content-container px-4 pb-4" style={{ height: showOrder ? 2000 : h(80) }}>
      <Row noGutters className="page-header py-4" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <PageTitle
          sm="4"
          title="รายรับ"
          subtitle="บัญชี"
          // title={tran('รายรับ')}
          // subtitle={tran('บัญชี')}
          className="text-sm-left"
        />
        {/* <Button onClick={_addNewOrder} pill>
          + สร้างรายการ
        </Button> */}
      </Row>
      {ready < 3 ? (
        <AccountSkeleton />
      ) : hasOrder ? (
        <div className="error">
          <div className="error__content">
            <i className="material-icons" style={{ fontSize: 58, color: 'lightgray', marginBottom: 10 }}>
              remove_from_queue
            </i>

            {isMobile ? (
              <h5 style={{ fontFamily: 'sans-serif', color: 'lightgrey' }}>ไม่มีรายการ</h5>
            ) : (
              <h4 style={{ color: 'lightgrey' }}>ไม่มีรายการ</h4>
            )}
            {/* {info && <h3>{info}</h3>}
              {details && <p>{details}</p>} */}
            {/* <Button
              onClick={_addNewOrder}
              pill
              style={{ marginTop: 20, marginBottom: 200 }}
            >
              + สร้างรายการ
            </Button> */}
          </div>
        </div>
      ) : (
        <PermissionGate permission="accounting.view">
          <Card small>
            {renderCardHeader()}
            <CardHeader className="border-bottom text-primary">รถและอุปกรณ์</CardHeader>
            <PermissionGate permission="sales.view">
              {renderOrderVehicles()}
            </PermissionGate>
            <CardHeader className="border-bottom text-primary">งานบริการ</CardHeader>
            <PermissionGate permission="service.view">
              {renderOrderService()}
            </PermissionGate>
            <CardHeader className="border-bottom text-primary">อะไหล่</CardHeader>
            <PermissionGate permission="inventory.view">
              {renderOrderPart()}
            </PermissionGate>
            <CardHeader className="border-bottom text-primary">อื่นๆ</CardHeader>
            <PermissionGate permission="accounting.view">
              {renderOrderOther()}
            </PermissionGate>
          </Card>
          {/* <Fab
            onClick={_addNewOrder}
            color="inherit"
            aria-label="add"
            className="mt-4"
          >
            <AddIcon />
          </Fab> */}
        </PermissionGate>
      )}

      <OverlaySlideComponent open={showOrder}>
        <IncomeDaily readOnly={readOnly} order={selectedOrder} onBack={() => setShowOrder(false)} category={category} />
      </OverlaySlideComponent>
    </Container>
  );
});

Income.displayName = 'Income';

export default memo(Income);
