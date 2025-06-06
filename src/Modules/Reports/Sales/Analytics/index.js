import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'shards-react';
import SmallStats from './components/SmallStats';
import TopSales from './components/TopSales';
import TypeSaled from './components/TypeSaled';
import Sessions from './components/Sessions';
import SaleByType from './components/SaleByType';
import ModelSaled from './components/ModelSaled';

import colors from 'utils/colors';
import { useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { showLog } from 'functions';
import PageHeader from 'components/common/PageHeader';
import { firstKey } from 'functions';
import { initDuration, initSessionsData, getChartData } from './api';
import { getSearchData } from 'firebase/api';
import { SaleType } from 'data/Constant';
import { useHistory, useLocation } from 'react-router-dom';
import Machines from '../Machines';
import { TableOutlined, PieChartOutlined } from '@ant-design/icons';
import { load } from 'functions';
import { getAllVehicles } from 'Modules/Utils';

const SaleAnalytics = () => {
  let location = useLocation();
  //  showLog('location', location.pathname);
  const params = location.state?.params;
  //  showLog({ params });

  const history = useHistory();

  const { employees } = useSelector(state => state.data);
  const initValues = {
    branch: params?.branchCode || 'all',
    // branch: user?.branch || '0450',
    duration: params?.duration || initDuration,
    durationValue: params?.durationValue || 'thisWeek'
  };

  const [ready, setReady] = useState();
  const [data, setData] = useState({
    vehicleType: [],
    saleType: [],
    saleModels: [],
    salesPerson: [],
    zone: [],
    sessionsData: initSessionsData,
    smallStatsData: [],
    saleItems: [],
    saleArr: []
  });
  const [vehicles, setVehicles] = useState({});
  const [isAnalytics, setIsAnalytics] = useState(
    typeof params?.isAnalytics !== 'undefined' ? params.isAnalytics : true
  );

  const branchRef = useRef(initValues.branch);
  const durationRef = useRef(initValues.duration);
  const durationValueRef = useRef(initValues?.durationValue);

  const _initData = async ({ branch, duration }) => {
    // Get data.
    load(true);
    let dArr = await getSearchData(
      'sections/sales/vehicles',
      { branchCode: branch, startDate: duration[0], endDate: duration[1] },
      ['saleNo', 'date']
    );

    // Get chart data.
    const mData = getChartData({ dArr, branch, duration });
    const allVehicles = await getAllVehicles();
    setVehicles(allVehicles);
    // showLog({ mData });
    load(false);
    setData(mData);
  };

  const initData = () => {
    _initData(initValues);
    setReady(true);
  };

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onHeaderChange = useCallback(headerChange => {
    let change = firstKey(headerChange);
    // showLog({ headerChange, change });
    _initData({
      branch: branchRef.current,
      duration: durationRef.current,
      ...headerChange
    });
    switch (change) {
      case 'branch':
        branchRef.current = headerChange.branch;
        break;
      case 'duration':
        durationRef.current = headerChange.duration;
        durationValueRef.current = headerChange.duration[2] || 'thisWeek';
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onMoreInfo = () => {
    setIsAnalytics(pa => !pa);
  };

  const { vehicleType, saleType, saleModels, salesPerson, zone, sessionsData, smallStatsData, saleItems, saleArr } =
    data;

  const saleByTypeData = {
    labels: saleType.map(it => (it.saleType ? SaleType[it.saleType] : 'ไม่ระบุ')),
    datasets: [
      {
        hoverBorderColor: colors.white.toRGBA(1),
        data: saleType.map(it => it.percentage),
        icons: Array.from(new Array(saleType.length), (_, i) => '<i class="material-icons">store</i>'),
        backgroundColor: Array.from(new Array(saleType.length), (_, i) =>
          colors.primary.toRGBA((saleType.length - i) * 0.1)
        )
      }
    ]
  };

  const _onSaleSelected = item => {
    let dArr = [...saleItems]
      .filter(l => l.salesPerson.includes(item.title))
      .map((it, n) => ({ ...it, key: n, id: n, branchCode: it.branch }));
    history.push('/reports/sale-by-person', {
      params: {
        data: dArr,
        seller:
          item.title && employees[item.title]
            ? `${employees[item.title].firstName}${
                employees[item.title].nickName ? `(${employees[item.title].nickName})` : ''
              }`
            : item.title || '-',
        onBack: {
          path: '/reports/sale-analytics',
          branchCode: branchRef.current,
          duration: durationRef.current,
          durationValue: durationValueRef.current,
          isAnalytics
        },
        isSale: true
      }
    });
  };

  showLog({
    vehicleType,
    saleType,
    saleModels,
    salesPerson,
    zone,
    sessionsData,
    smallStatsData,
    saleItems
  });

  return (
    <Container fluid className="main-content-container px-4">
      <PageHeader
        title="รถและอุปกรณ์"
        subtitle="Sale Analytics"
        hasBranch
        hasAllBranch
        hasDuration
        hasAllDate
        onChange={_onHeaderChange}
        defaultBranch={initValues.branch}
        defaultDuration={durationValueRef.current}
        onMoreInfo={_onMoreInfo}
        moreInfoTitle={!isAnalytics ? 'ข้อมูลแบบวิเคราะห์' : 'ข้อมูลแบบตาราง'}
        moreInfoIcon={!isAnalytics ? <PieChartOutlined /> : <TableOutlined />}
      />

      {!ready ? (
        Array.from(new Array(3), (_, i) => <Skeleton key={i} />)
      ) : isAnalytics ? (
        <div>
          {/* Small Stats Blocks */}
          <Row>
            {smallStatsData.map((stats, idx) => (
              <Col key={idx} md="6" lg="3" className="mb-4">
                <SmallStats
                  id={`small-stats-${idx}`}
                  chartData={stats.datasets}
                  chartLabels={stats.chartLabels}
                  label={stats.label}
                  value={stats.value}
                  percentage={stats.percentage}
                  increase={stats.increase}
                  decrease={stats.decrease}
                />
              </Col>
            ))}
          </Row>

          <Row>
            {/* Sessions */}
            <Col lg="8" md="12" sm="12" className="mb-4">
              <Sessions chartData={sessionsData} title="แนวโน้ม" />
            </Col>

            {/* Users by Device */}
            <Col lg="4" md="6" sm="6" className="mb-4">
              <SaleByType chartData={saleByTypeData} title="แบ่งตามประเภทการขาย" />
            </Col>

            {/* Top Referrals */}
            <Col lg="3" sm="6" className="mb-4">
              <TypeSaled data={vehicleType} title="ประเภท" />
            </Col>

            {/* Goals Overview */}
            <Col lg="5" className="mb-4">
              <ModelSaled data={saleModels} models={vehicles} title="รุ่น" />
            </Col>

            <Col lg="4" className="mb-4">
              <TopSales salesPerson={salesPerson} title="Top 10 พนักงานขาย" onPress={_onSaleSelected} />
            </Col>
          </Row>
        </div>
      ) : (
        <div>
          <Machines
            saleArr={saleArr}
            saleItems={saleItems}
            salesPerson={salesPerson}
            saleModels={saleModels}
            onSaleSelected={_onSaleSelected}
          />
        </div>
      )}
    </Container>
  );
};

SaleAnalytics.propTypes = {
  /**
   * The small stats data.
   */
  smallStats: PropTypes.array
};

SaleAnalytics.defaultProps = {
  smallStats: [
    {
      label: 'Users',
      value: '2,390',
      percentage: '12.4%',
      increase: true,
      chartLabels: [null, null, null, null, null],
      decrease: false,
      datasets: [
        {
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: colors.primary.toRGBA(0.1),
          borderColor: colors.primary.toRGBA(),
          data: [9, 3, 3, 9, 9]
        }
      ]
    },
    {
      label: 'Sessions',
      value: '8,391',
      percentage: '7.21%',
      increase: false,
      chartLabels: [null, null, null, null, null],
      decrease: true,
      datasets: [
        {
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: colors.success.toRGBA(0.1),
          borderColor: colors.success.toRGBA(),
          data: [3.9, 4, 4, 9, 4]
        }
      ]
    },
    {
      label: 'Pageviews',
      value: '21,293',
      percentage: '3.71%',
      increase: true,
      chartLabels: [null, null, null, null, null],
      decrease: false,
      datasets: [
        {
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: colors.warning.toRGBA(0.1),
          borderColor: colors.warning.toRGBA(),
          data: [6, 6, 9, 3, 3]
        }
      ]
    },
    {
      label: 'Pages/Session',
      value: '6.43',
      percentage: '2.71%',
      increase: false,
      chartLabels: [null, null, null, null, null],
      decrease: true,
      datasets: [
        {
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: colors.salmon.toRGBA(0.1),
          borderColor: colors.salmon.toRGBA(),
          data: [0, 9, 3, 3, 3]
        }
      ]
    }
  ]
};

export default SaleAnalytics;
