import React, { useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Container } from 'shards-react';
import PageHeader from 'components/common/PageHeader';
import EditableCellTable from 'components/EditableCellTable';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { columns, getMktChannelsData, getColumns, initData, formatDataByArea, getAreaColumns } from './api';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';
import dayjs from 'dayjs';
import { sortArr } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';

export default () => {
  let location = useLocation();
  // showLog('location', location.pathname);
  const params = location.state?.params;
  const history = useHistory();

  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [branch, setBranch] = useState(params?.branch || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450');
  const [data, setData] = useMergeState(initData);
  const [loading, setLoading] = useState(false);
  const [eLoading, setELoading] = useState(false);
  const [rowExpanded, setExpanded] = useMergeState({
    1: false,
    2: false,
    3: false
  });

  const _onHeaderChange = val => {
    // showLog({ header_change: val });
    setBranch(val.branch);
    getData(val.branch);
  };
  const [selected, setSelected] = useMergeState({
    year: dayjs().format('YYYY'),
    month: dayjs().format('YYYY-MM'),
    date: dayjs().format('YYYY-MM-DD')
  });

  const getData = async branch => {
    try {
      setLoading(true);
      const channelData = await getMktChannelsData(branch);

      setData(channelData);
      channelData.yearArr.length > 0 &&
        handleSelect(channelData.yearArr[channelData.yearArr.length - 1], 'year', channelData);
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
      getData(branch);
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
        monthArr = sortArr(
          monthAll.filter(l => l.year === record.year),
          ['-month']
        );
        dateArr = sortArr(
          dateAll.filter(l => l.month === monthArr[0].month),
          ['-date']
        );
        setSelected({ year: record.year, month: monthArr[0].month });
        setData({
          monthArr,
          dateArr
        });
        break;
      case 'month':
        setSelected({ month: record.month });
        dateArr = sortArr(
          dateAll.filter(l => l.month === record.month),
          ['-date']
        );
        setData({
          dateArr
        });
        break;
      case 'date':
        setSelected({ date: record.date });
        history.push('/reports/sale-channel-details', {
          params: {
            record: { ...record, branchCode: branch },
            data,
            onBack: {
              path: '/reports/mkt/marketing-channels',
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

  let dColumns = getColumns('date', branch === 'all', data?.headers);
  let mColumns = getColumns('month', branch === 'all', data?.headers);
  let yColumns = getColumns('year', branch === 'all', data?.headers);
  // showLog({ dColumns, mColumns, yColumns });
  // return (
  //   <PageHeader
  //     title="รายงานช่องทางการตลาด"
  //     subtitle="Marketing Channels Report"
  //     hasBranch
  //     hasAllBranch
  //     defaultBranch={branch}
  //     onChange={_onHeaderChange}
  //   />
  // );

  const expandedRowRender = (record, type) => {
    setELoading(true);
    const arr = formatDataByArea(data.all, type, data.headers, record[type]);
    setELoading(false);
    return (
      <div className="bg-light p-3 border">
        <EditableCellTable
          dataSource={arr}
          columns={getAreaColumns(data.headers)}
          loading={eLoading}
          summary={pageData => (
            <TableSummary
              pageData={pageData}
              dataLength={columns.length}
              startAt={0}
              sumKeys={['total', ...data.headers]}
              align="center"
              labelAlign="center"
              sumClassName={['text-primary']}
            />
          )}
          pagination={false}
        />
      </div>
    );
  };

  return (
    <Container fluid className="main-content-container px-4">
      <PageHeader
        title="รายงานช่องทางการตลาด"
        subtitle="Marketing Channels Report"
        hasBranch
        hasAllBranch
        defaultBranch={branch}
        onChange={_onHeaderChange}
        onlyUserBranch={user.branch}
      />
      <div className="d-flex mx-3 mt-3">
        <label className="text-primary text-center">ช่องทางการตลาดรายปี</label>
      </div>
      <EditableCellTable
        dataSource={data.yearArr}
        columns={yColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData =>
          !rowExpanded[1] ? (
            <TableSummary
              pageData={pageData}
              dataLength={columns.length}
              startAt={branch === 'all' ? 1 : 2}
              sumKeys={['total', ...data.headers]}
              align="center"
              labelAlign="center"
              sumClassName={['text-primary']}
            />
          ) : undefined
        }
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'year')
          };
        }}
        // hasChevron
        pagination={{ pageSize: 5 }}
        rowClassName={(record, index) => (record.year === selected.year ? 'selected-row' : undefined)}
        expandable={{
          expandedRowRender: record => expandedRowRender(record, 'year'),
          rowExpandable: record => record.total > 0
        }}
        onExpand={expanded => setExpanded({ 1: expanded })}
      />
      {selected?.year && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.monthArr.length > 0 ? `ช่องทางการตลาดรายเดือน ประจำปี ${selected.year}` : 'ช่องทางการตลาดรายเดือน'}
          </label>
        </div>
      )}
      <EditableCellTable
        dataSource={data.monthArr}
        columns={mColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData =>
          !rowExpanded[2] ? (
            <TableSummary
              pageData={pageData}
              dataLength={columns.length}
              startAt={branch === 'all' ? 1 : 2}
              sumKeys={['total', ...data.headers]}
              align="center"
              labelAlign="center"
              sumClassName={['text-primary']}
            />
          ) : undefined
        }
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'month')
          };
        }}
        pagination={{ pageSize: 12 }}
        rowClassName={(record, index) => (record.month === selected.month ? 'selected-row' : undefined)}
        expandable={{
          expandedRowRender: record => expandedRowRender(record, 'month'),
          rowExpandable: record => record.total > 0
        }}
        onExpand={expanded => setExpanded({ 2: expanded })}
      />
      {selected?.month && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.dateArr.length > 0
              ? `ช่องทางการตลาดรายวัน ประจำเดือน ${dayjs(selected.month, 'YYYY-MM').format('MMMM YYYY')}`
              : 'ช่องทางการตลาดรายวัน'}
          </label>
        </div>
      )}
      <EditableCellTable
        dataSource={data.dateArr}
        columns={dColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData =>
          !rowExpanded[3] ? (
            <TableSummary
              pageData={pageData}
              dataLength={columns.length}
              startAt={branch === 'all' ? 1 : 2}
              sumKeys={['total', ...data.headers]}
              align="center"
              labelAlign="center"
              sumClassName={['text-primary']}
            />
          ) : undefined
        }
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'date')
          };
        }}
        hasChevron
        pagination={{ pageSize: 31 }}
        rowClassName={(record, index) => (record.date === selected.date ? 'selected-row' : undefined)}
        expandable={{
          expandedRowRender: record => expandedRowRender(record, 'date'),
          rowExpandable: record => record.total > 0
        }}
        onExpand={expanded => setExpanded({ 3: expanded })}
      />
    </Container>
  );
};
