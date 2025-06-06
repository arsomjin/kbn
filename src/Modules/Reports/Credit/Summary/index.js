import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'shards-react';
import { showLog } from 'functions';
import EditableCellTable from 'components/EditableCellTable';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { getCreditData, getColumns, initData } from './api';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';
import moment from 'moment-timezone';
import { useHistory, useLocation } from 'react-router-dom';
import SaleTypeSelector from 'components/SaleTypeSelector';
import PageTitle from 'components/common/PageTitle';
import { Form } from 'antd';
import BranchSelector from 'components/BranchSelector';
import { isMobile } from 'react-device-detect';
import { firstKey } from 'functions';

export default () => {
  let location = useLocation();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  const history = useHistory();

  const { user } = useSelector(state => state.auth);
  const [branch, setBranch] = useState(params?.branch || user?.branch || '0450');
  const [data, setData] = useMergeState(initData);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const searchValues = useRef({
    branchCode: params?.branch || user?.branch || '0450',
    saleType: 'sklLeasing'
  });

  const _onValuesChange = val => {
    if (firstKey(val) === 'branchCode') {
      setBranch(val['branchCode']);
    }
    searchValues.current = { ...searchValues.current, ...val };
    getData({ ...searchValues.current, ...val });
  };
  const [selected, setSelected] = useMergeState({
    year: moment().format('YYYY'),
    month: moment().format('YYYY-MM'),
    date: moment().format('YYYY-MM-DD'),
    saleType: 'sklLeasing',
    branchCode: params?.branch || user?.branch || '0450'
  });

  const getData = async search => {
    try {
      setLoading(true);
      const creditData = await getCreditData(search);
      setData(creditData);
      creditData.yearArr.length > 0 &&
        handleSelect(creditData.yearArr[creditData.yearArr.length - 1], 'year', creditData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.data && params?.selected) {
      setData(params.data);
      setSelected(params.selected);
      // setBranch(params.branch);
    } else {
      getData(searchValues.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   getData(branch);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [branch]);

  const handleSelect = (record, type, obj) => {
    let dateArr = obj?.dateArr || data.dateArr;
    let monthArr = obj?.monthArr || data.monthArr;
    let monthAll = obj?.monthAll || data.monthAll;
    let dateAll = obj?.dateAll || data.dateAll;
    switch (type) {
      case 'year':
        monthArr = monthAll.filter(
          l => l.year === record.year && l.saleType === record.saleType && l.branchCode === record.branchCode
        );
        dateArr = dateAll.filter(
          l =>
            l.month === monthArr[monthArr.length - 1].month &&
            l.saleType === record.saleType &&
            l.branchCode === record.branchCode
        );
        setSelected({
          year: record.year,
          month: monthArr[monthArr.length - 1].month,
          saleType: record.saleType,
          branchCode: record.branchCode
        });
        setData({
          monthArr,
          dateArr
        });
        break;
      case 'month':
        setSelected({
          month: record.month,
          saleType: record.saleType,
          branchCode: record.branchCode
        });
        dateArr = dateAll.filter(
          l => l.month === record.month && l.saleType === record.saleType && l.branchCode === record.branchCode
        );
        setData({
          dateArr
        });
        break;
      case 'date':
        setSelected({
          date: record.date,
          saleType: record.saleType,
          branchCode: record.branchCode
        });
        return;
        history.push('/reports/sale-assessment-details', {
          params: {
            record: { ...record, branchCode: branch },
            data,
            onBack: {
              path: '/reports/sale-assessment',
              data,
              selected: { ...selected, date: record.date },
              branch
            }
          }
        });
        break;

      default:
        break;
    }
  };

  let dColumns = getColumns('date', branch === 'all', data.arrType);
  let mColumns = getColumns('month', branch === 'all', data.arrType);
  let yColumns = getColumns('year', branch === 'all', data.arrType);

  let sumKeys = [
    ...data.arrType.filter(
      l => ['scd', 'cdd'].includes(l.substr(l.length - 3)) && !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l)
    ),
    'amtSKLReceive',
    'taxInvoiceCount'
  ];

  const createSumClass = (ln, type) => [...Array(ln).keys()].map(() => `text-${type}`);

  const sumClass = [
    ...createSumClass(
      data.arrType.filter(
        l => ['scd'].includes(l.substr(l.length - 3)) && !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l)
      ).length,
      'warning'
    ),
    ...createSumClass(
      data.arrType.filter(
        l => ['scd'].includes(l.substr(l.length - 3)) && !['อุปกรณ์', 'เครื่องยนต์', 'ของแถม'].includes(l)
      ).length,
      'primary'
    ),
    'text-success'
  ];
  showLog({ sumKeys, sumClass, dColumns, mColumns, yColumns, branch });

  return (
    <Container fluid className={`main-content-container ${isMobile ? '' : 'px-3'}`}>
      <Form
        form={form}
        onValuesChange={_onValuesChange}
        initialValues={{
          branchCode: params?.branch || user?.branch || '0450',
          saleType: 'sklLeasing'
        }}
        size="small"
        layout="vertical"
      >
        <Row className="px-3 pt-3 border-bottom">
          <PageTitle sm="4" title="สรุปยอดตัดขาย-รับเงิน" subtitle="สินเชื่อ" className="text-sm-left" />
          <Col md="4">
            <Form.Item label="สาขา" name="branchCode">
              <BranchSelector hasAll onlyUserBranch={user.branch} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item label="ประเภทการขาย" name="saleType">
              <SaleTypeSelector hasAll onlyLeasing />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div className="d-flex mx-3 mt-3">
        <label className="text-primary text-center">รายปี</label>
      </div>
      <EditableCellTable
        dataSource={data.yearArr}
        columns={yColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={yColumns.length}
            startAt={2}
            sumKeys={sumKeys}
            align="center"
            labelAlign="center"
            sumClassName={sumClass}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'year')
          };
        }}
        // hasChevron
        pagination={{ pageSize: 36, hideOnSinglePage: true }}
        rowClassName={(record, index) =>
          record.year === selected.year &&
          record.saleType === selected.saleType &&
          record.branchCode === selected.branchCode
            ? 'selected-row'
            : undefined
        }
      />
      {selected?.year && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.monthArr.length > 0 ? `รายเดือน ประจำปี ${selected.year}` : 'รายเดือน'}
          </label>
        </div>
      )}
      <EditableCellTable
        dataSource={data.monthArr}
        columns={mColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={mColumns.length}
            startAt={2}
            sumKeys={sumKeys}
            align="center"
            labelAlign="center"
            sumClassName={sumClass}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'month')
          };
        }}
        // hasChevron
        pagination={{ pageSize: 12, hideOnSinglePage: true }}
        rowClassName={(record, index) =>
          record.month === selected.month &&
          record.saleType === selected.saleType &&
          record.branchCode === selected.branchCode
            ? 'selected-row'
            : undefined
        }
      />
      {selected?.month && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.dateArr.length > 0
              ? `รายวัน ประจำเดือน ${moment(selected.month, 'YYYY-MM').format('MMMM YYYY')}`
              : 'รายวัน'}
          </label>
        </div>
      )}
      <EditableCellTable
        dataSource={data.dateArr}
        columns={dColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={dColumns.length}
            startAt={2}
            sumKeys={sumKeys}
            align="center"
            labelAlign="center"
            sumClassName={sumClass}
          />
        )}
        // onRow={(record, rowIndex) => {
        //   return {
        //     onClick: () => handleSelect(record, 'date'),
        //   };
        // }}
        // hasChevron
        pagination={{ pageSize: 31, hideOnSinglePage: true }}
        rowClassName={(record, index) =>
          record.date === selected.date &&
          record.saleType === selected.saleType &&
          record.branchCode === selected.branchCode
            ? 'selected-row'
            : undefined
        }
      />
    </Container>
  );
};
