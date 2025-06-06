import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, ButtonGroup, Button } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import SmallStats from './SmallStats';
import IncomeChart from './IncomeChart';
import IncomeBySections from './IncomeBySections';
import NewDraft from './NewDraft';
import Discussions from './Discussions';
import TopReferrals from './TopReferrals';
import { DefaultProps, InitialData, RANGES } from '../initValues';
import { showWarn } from 'functions';
import { getOverviewDataFromRange } from '../api';
import { load } from 'functions';
const Dashboard = ({ smallStats }) => {
  let isMounted = true;
  const [range, setRange] = useState('day');
  const [data, setData] = useState(InitialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isMounted = true;
    _onRangeChange('day');
    return () => {
      isMounted = false;
    };
  }, []);

  const _onRangeChange = async rg => {
    try {
      setRange(rg);
      if (!isMounted) return;
      if (data[rg].updated) {
        return;
      }
      setLoading(true);
      if (!isMounted) return;
      load(true);
      const mData = await getOverviewDataFromRange(rg);
      if (!isMounted) return;
      let nData = {
        ...data,
        [rg]: {
          smallStats: mData.smallStats,
          bySections: mData.bySections,
          updated: true
        }
      };
      setData(nData);
      if (!isMounted) return;
      setLoading(false);
      load(false);
    } catch (e) {
      if (!isMounted) return;
      setLoading(false);
      showWarn(e);
      load(false);
    }
  };

  return (
    <Container fluid className="main-content-container px-4">
      {/* Page Header */}
      <Row noGutters className="page-header py-4">
        <PageTitle title="ภาพรวม" subtitle="Dashboard" className="text-sm-left mb-3" />
        <Col xs="12" sm="4" className="col d-flex align-items-center">
          <ButtonGroup size="sm" className="d-inline-flex mt-3 mb-sm-0 mx-auto">
            {Object.keys(RANGES).map(l => (
              <Button
                key={l}
                onClick={() => _onRangeChange(l)}
                theme={range === l ? 'primary' : 'white'}
                style={{ width: 60 }}
              >
                {RANGES[l]}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>
      {/* Small Stats Blocks */}
      <Row>
        {data[range].smallStats.map((stats, idx) => (
          <Col className="col-lg mb-4" md="6" sm="6" key={idx}>
            <SmallStats
              id={`small-stats-${idx}`}
              variation="1"
              chartData={stats.datasets}
              chartLabels={stats.chartLabels}
              label={stats.label}
              sublabel={stats.sublabel}
              value={stats.value}
              percentage={stats.percentage}
              increase={stats.increase}
              decrease={stats.decrease}
              loading={loading}
            />
          </Col>
        ))}
      </Row>
      <Row>
        {/* Users Dashboard */}
        <Col lg="8" md="6" sm="12" className="mb-4">
          <IncomeChart />
        </Col>

        {/* Users by Device */}
        <Col lg="4" md="6" sm="12" className="mb-4">
          <IncomeBySections chartData={data[range].bySections} loading={loading} />
        </Col>
      </Row>
      <Row>
        {/* New Draft */}
        <Col lg="4" md="6" sm="12" className="mb-4">
          <NewDraft />
        </Col>

        {/* Discussions */}
        <Col lg="5" md="12" sm="12" className="mb-4">
          <Discussions />
        </Col>

        {/* Top Referrals */}
        <Col lg="3" md="12" sm="12" className="mb-4">
          <TopReferrals />
        </Col>
      </Row>
      {/* <Cover info="อยู่ในระหว่างเก็บรวบรวมข้อมูล" /> */}
    </Container>
  );
};

Dashboard.propTypes = {
  /**
   * The small stats dataset.
   */
  smallStats: PropTypes.array
};

Dashboard.defaultProps = DefaultProps;

export default Dashboard;
