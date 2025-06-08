import React, { useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Container } from 'shards-react';
import PageHeader from 'components/common/PageHeader';
import EditableCellTable from 'components/EditableCellTable';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { columns, getReservationData, getColumns, initData } from './api';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';
import dayjs from 'dayjs';
import { sortArr } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';

export default () => {
  let location = useLocation();
  //  showLog('location', location.pathname);
  const params = location.state?.params;
  const history = useHistory();

  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [branch, setBranch] = useState(params?.branch || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450');
  const [data, setData] = useMergeState(initData);
  const [loading, setLoading] = useState(false);
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
      const reservationData = await getReservationData(branch);
      setData(reservationData);
      reservationData.yearArr.length > 0 &&
        handleSelect(reservationData.yearArr[reservationData.yearArr.length - 1], 'year', reservationData);
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
        history.push('/reports/all-reservation-details', {
          params: {
            record: { ...record, branchCode: branch },
            data,
            onBack: {
              path: '/reports/all-reservation',
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

  let dColumns = getColumns('date', branch === 'all');
  let mColumns = getColumns('month', branch === 'all');
  let yColumns = getColumns('year', branch === 'all');

  return (
    <Container fluid className="main-content-container px-4">
      <PageHeader
        title="รายงานยอดจอง"
        subtitle="Reservation Report"
        hasBranch
        hasAllBranch
        defaultBranch={branch}
        onChange={_onHeaderChange}
        onlyUserBranch={user.branch}
      />
      <div className="d-flex mx-3 mt-3">
        <label className="text-primary text-center">ยอดจองรายปี</label>
      </div>
      <EditableCellTable
        dataSource={data.yearArr}
        columns={yColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={branch === 'all' ? 0 : 1}
            sumKeys={['total', 'approved', 'disapproved', 'waiting', 'canceled', 'notAssigned']}
            align="center"
            labelAlign="center"
            sumClassName={['text-primary', 'text-success', 'text-danger', 'text-warning', 'text-danger', undefined]}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'year')
          };
        }}
        // hasChevron
        pagination={{ pageSize: 36, hideOnSinglePage: true }}
        rowClassName={(record, index) => (record.year === selected.year ? 'selected-row' : undefined)}
      />
      {selected?.year && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.monthArr.length > 0 ? `ยอดจองรายเดือน ประจำปี ${selected.year}` : 'ยอดจองรายเดือน'}
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
            dataLength={columns.length}
            startAt={branch === 'all' ? 0 : 1}
            sumKeys={['total', 'approved', 'disapproved', 'waiting', 'canceled', 'notAssigned']}
            align="center"
            labelAlign="center"
            sumClassName={['text-primary', 'text-success', 'text-danger', 'text-warning', 'text-danger', undefined]}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'month')
          };
        }}
        // hasChevron
        pagination={{ pageSize: 12, hideOnSinglePage: true }}
        rowClassName={(record, index) => (record.month === selected.month ? 'selected-row' : undefined)}
      />
      {selected?.month && (
        <div className="d-flex mx-3 mt-3">
          <label className="text-primary text-center">
            {data.dateArr.length > 0
              ? `ยอดจองรายวัน ประจำเดือน ${dayjs(selected.month, 'YYYY-MM').format('MMMM YYYY')}`
              : 'ยอดจองรายวัน'}
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
            dataLength={columns.length}
            startAt={branch === 'all' ? 0 : 1}
            sumKeys={['total', 'approved', 'disapproved', 'waiting', 'canceled', 'notAssigned']}
            align="center"
            labelAlign="center"
            sumClassName={['text-primary', 'text-success', 'text-danger', 'text-warning', 'text-danger', undefined]}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record, 'date')
          };
        }}
        hasChevron
        pagination={{ pageSize: 31, hideOnSinglePage: true }}
        rowClassName={(record, index) => (record.date === selected.date ? 'selected-row' : undefined)}
      />
    </Container>
  );
};
