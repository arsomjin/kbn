import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'shards-react';
import SmallStats from './components/SmallStats';
import TopReferrals from './components/TopReferrals';
import ModelOwned from './components/ModelOwned';
import Sessions from './components/Sessions';
import CustomersByBranch from './components/CustomersByBranch';
import ModelInterested from './components/ModelInterested';

import colors from 'utils/colors';
import { useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { showLog } from 'functions';
import PageHeader from 'components/common/PageHeader';
import { firstKey } from 'functions';
import moment from 'moment';
import { initDuration, initSessionsData, getChartData } from './api';
import { useHistory, useLocation } from 'react-router';
import { getAllCustomers, getAllVehicles } from 'Modules/Utils';

const CustomersReport = ({ smallStats }) => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { branches } = useSelector(state => state.data);
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const initValues = {
    // branch: 'all',
    branch: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    duration: initDuration
  };

  const [ready, setReady] = useState();
  const [data, setData] = useState({
    plants: [],
    hasMKTData: [],
    whenToBuy: [],
    ownedModel: [],
    interestedModel: [],
    referralData: [],
    zone: [],
    monthsToBuy: [],
    sessionsData: initSessionsData,
    customersByMonth: [],
    smallStatsData: []
  });
  const [mCustomers, setCustomers] = useState(params?.mCustomers || []);
  const [vehicles, setVehicles] = useState({});

  const branchRef = useRef(initValues.branch);
  const durationRef = useRef(initValues.duration);
  const customersRef = useRef(null);

  const _getData = async ({ branch, duration, aCustomers }) => {
    const mCus = Object.keys(aCustomers).map(k => ({
      ...aCustomers[k],
      ...(aCustomers[k].agent && { agent: aCustomers[k].agent.trim() }),
      branchName: aCustomers[k].branch ? branches[aCustomers[k].branch].branchName : 'ไม่ระบุ',
      counter: 1,
      inputDate: moment(aCustomers[k].created).format('YYYY-MM-DD')
    }));

    let dArr = [...mCus];
    const mData = getChartData({ dArr, branch, duration });
    setCustomers(mCus);
    setData(mData);
  };

  const initData = async () => {
    // showLog('customers_ref', customersRef.current);
    //  showLog({ params });
    // getCustomers
    if (!customersRef.current) {
      // Just once.
      customersRef.current = params?.mCustomers || (await getAllCustomers());
    }
    _getData({ ...initValues, aCustomers: customersRef.current });
    const allVehicles = await getAllVehicles();
    setVehicles(allVehicles);
    setReady(true);
  };

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onHeaderChange = useCallback(headerChange => {
    let change = firstKey(headerChange);
    //  showLog({ headerChange, change });
    _getData({
      ...{ branch: branchRef.current, duration: durationRef.current },
      ...headerChange
    });
    switch (change) {
      case 'branch':
        branchRef.current = headerChange.branch;
        break;
      case 'duration':
        durationRef.current = headerChange.duration;
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    plants,
    hasMKTData,
    whenToBuy,
    ownedModel,
    interestedModel,
    referralData,
    zone,
    monthsToBuy,
    sessionsData,
    customersByMonth,
    smallStatsData
  } = data;

  let mZone = zone;
  const customersByBranchData = {
    labels: mZone.map(it => (branches[it.branch] ? branches[it.branch].branchName : 'ไม่ระบุ')),
    datasets: [
      {
        hoverBorderColor: colors.white.toRGBA(1),
        data: mZone.map(it => it.percentage),
        icons: Array.from(new Array(mZone.length), (_, i) => '<i class="material-icons">store</i>'),
        backgroundColor: Array.from(new Array(mZone.length), (_, i) => colors.primary.toRGBA((mZone.length - i) * 0.1))
      }
    ]
  };

  const _statsClick = (item, idx) => {
    let dArr = [...mCustomers]
      .filter(l => l.branchName === item.branch)
      .map((it, n) => ({ ...it, key: n, id: n, branchCode: it.branch }));
    history.push('/sale-customer-list', {
      params: {
        data: dArr,
        mCustomers
      }
    });
  };

  showLog({
    plants,
    hasMKTData,
    whenToBuy,
    ownedModel,
    interestedModel,
    referralData,
    zone,
    monthsToBuy,
    sessionsData,
    customersByMonth,
    smallStatsData
  });

  return (
    <Container fluid className="main-content-container px-4">
      <PageHeader
        title="รายงานลูกค้า"
        subtitle="Customers Report"
        hasBranch
        hasAllBranch
        hasDuration
        hasAllDate
        onChange={_onHeaderChange}
        defaultBranch={initValues.branch}
        defaultDuration="all"
      />

      {!ready ? (
        Array.from(new Array(3), (_, i) => <Skeleton key={i} />)
      ) : (
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
                  onPress={() => _statsClick(stats, idx)}
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
              <CustomersByBranch chartData={customersByBranchData} title="ลูกค้า แบ่งตามสาขา" />
            </Col>

            {/* Top Referrals */}
            <Col lg="3" sm="6" className="mb-4">
              <TopReferrals referralData={referralData} title="Top 10 ตัวแทน" />
            </Col>

            {/* Goals Overview */}
            <Col lg="5" className="mb-4">
              <ModelInterested data={interestedModel.slice(0, 4)} models={vehicles} title="รุ่นที่ลูกค้าสนใจ" />
            </Col>

            {/* Country Reports */}
            <Col lg="4" className="mb-4">
              <ModelOwned data={ownedModel} models={vehicles} title="ลูกค้าเก่ามีรถรุ่น" />
              {/* <Regions
                  data={zone}
                  branches={branches}
                  title="ลูกค้าแบ่งตามสาขา"
                /> */}
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

CustomersReport.propTypes = {
  /**
   * The small stats data.
   */
  smallStats: PropTypes.array
};

CustomersReport.defaultProps = {
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

export default CustomersReport;
