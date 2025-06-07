import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import PageTitle from 'components/common/PageTitle';
import AccountReport from './Components/AccountReport';
import AccountPieChart from './Components/AccountPieChart';
import { useSelector } from 'react-redux';
import { Select, Skeleton } from 'antd';
import { dateData, monthData, weekData, yearData } from './data';
import AccountTable from './Components/AccountTable';
import { Numb } from 'functions';
import { PermissionGate, GeographicBranchSelector } from 'components';
import { usePermissions } from 'hooks/usePermissions';
const { Option } = Select;

const Overview = () => {
  const { branches } = useSelector(state => state.data);
  const { getAccessibleBranches, hasPermission, shouldShowProvinceSelector } = usePermissions();
  const [branchCode, setBranch] = useState('all');
  const [range, setRange] = useState('เดือน');
  const [data, setData] = useState([]);
  const [pieData, setPieData] = useState([]);

  // Filter branches based on user's geographic access
  const accessibleBranches = getAccessibleBranches(branches);

  const _getData = range => {
    //TODO
    let result = [];
    switch (range) {
      case 'วัน':
        result = dateData;
        break;
      case 'สัปดาห์':
        result = weekData;
        break;
      case 'เดือน':
        result = monthData;
        break;
      case 'ปี':
        result = yearData;
        break;

      default:
        break;
    }
    let income = result.reduce((sum, elem) => sum + elem.income, 0);
    let expense = result.reduce((sum, elem) => sum + elem.expense, 0);
    let tax = result.reduce((sum, elem) => sum + elem.tax, 0);
    let total = income + expense + tax;

    setData(result);
    let dataArr = [
      Numb(((income / total) * 100).toFixed(2)),
      Numb(((expense / total) * 100).toFixed(2)),
      Numb(((tax / total) * 100).toFixed(2))
    ];
    setPieData(dataArr);
  };

  useEffect(() => {
    _getData('เดือน');
  }, []);

  const _onBranchSelected = br => {
    //  showLog('select', br);
    setBranch(br);
  };

  const _onRangeChange = useCallback(rng => {
    setRange(rng);
    _getData(rng);
  }, []);

  const selectOptions = [
    <Option key="all" value="all">
      ทุกสาขา
    </Option>,
    ...Object.keys(accessibleBranches).map(key => (
      <Option key={key} value={key}>
        {accessibleBranches[key].branchName}
      </Option>
    ))
  ];

  return (
    <Container fluid className="main-content-container px-4">
      <Row noGutters className="page-header py-4">
        <PageTitle title="บัญชี" subtitle="ภาพรวม" className="text-sm-left mb-3" />
        <Col sm="4" className="d-flex mt-3">
          <PermissionGate permission="accounting.view">
            <GeographicBranchSelector
              placeholder="เลือกสาขา"
              value={branchCode}
              onChange={_onBranchSelected}
              hasAll={true}
              style={{ width: 240 }}
              respectRBAC={true}
            />
          </PermissionGate>
        </Col>
        {/* <Col sm="4" className="col d-flex align-items-center">
        <ButtonGroup size="sm" className="d-inline-flex mb-3 mb-sm-0 mx-auto">
          <Button theme="white" tag={NavLink} to="/analytics">
            Traffic
          </Button>
          <Button theme="white" tag={NavLink} to="/ecommerce">
            Sales
          </Button>
        </ButtonGroup>
      </Col>

      <Col sm="4" className="d-flex">
        <RangeDatePicker className="justify-content-end" />
      </Col> */}
      </Row>

      <Row>
        {/* Sales Report */}
        <Col lg="8" md="12" sm="12" className="mb-4">
          {data.length > 0 ? (
            <AccountReport
              data={data}
              range={range}
              onRangeChange={_onRangeChange}
              branchName={branchCode === 'all' ? 'ทั้งหมด' : accessibleBranches[branchCode]?.branchName || 'ไม่พบสาขา'}
            />
          ) : (
            <Skeleton active />
          )}
        </Col>

        {/* Sales by Categories */}
        <Col lg="4" md="6" sm="6" className="mb-4">
          <AccountPieChart
            data={pieData}
            branchName={branchCode === 'all' ? 'ทั้งหมด' : accessibleBranches[branchCode]?.branchName || 'ไม่พบสาขา'}
            range={`ราย${range}`}
          />
        </Col>
      </Row>
      <PermissionGate permission="accounting.view">
        <AccountTable data={data} range={range} />
      </PermissionGate>
      <p className="text-light text-right my-4 mx-4">หมายเหตุ: ข้อมูลที่แสดง ยังไม่ใข่ข้อมูลจริง *</p>
    </Container>
  );
};

export default Overview;
