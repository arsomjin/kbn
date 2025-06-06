import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { useSelector } from 'react-redux';
import { CancelModal, columns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { FirebaseContext } from '../../../firebase';
import { showLog, showWarn, firstKey, showSuccess, load } from 'functions';
import PageHeader from 'components/common/PageHeader';
import { useLocation } from 'react-router-dom';
import { initDuration } from 'data/Constant';
import { getSearchData } from 'firebase/api';
import { useMergeState } from 'api/CustomHooks';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { Button } from 'elements';
import Modal from 'antd/lib/modal/Modal';
import numeral from 'numeral';
import { getChanges } from 'functions';
import { h } from 'api';
import { sortArr } from 'functions';
import { debounce } from 'lodash';
import { arrayForEach } from 'functions';
import { fetchSearchsEachField } from 'utils';
import { checkDoc } from 'firebase/api';
const { Search } = Input;

export default ({}) => {
  const { api, firestore } = useContext(FirebaseContext);
  let location = useLocation();
  const params = location.state?.params;
  //  showLog({ params });

  const { user } = useSelector(state => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initValues = {
    branch: params?.branchCode || 'all',
    // branch: user?.branch || '0450',
    duration: params?.duration || initDuration
  };
  const [bModal, setModal] = useMergeState({ record: {}, visible: false });
  const [ready, setReady] = useState(true);
  const [searchText, setSearchText] = useState(null);

  const branchRef = useRef(initValues.branch);
  const durationRef = useRef(initValues.duration);

  const _initData = async ({ branch, duration }) => {
    try {
      // Get data.
      setLoading(true);
      let dArr = await getSearchData(
        'sections/sales/bookings',
        {
          branchCode: branch,
          startDate: duration[0],
          endDate: duration[1]
        },
        ['bookNo', 'date']
      );
      dArr = sortArr(
        dArr.filter(l => !l.canceled),
        '-date'
      );
      dArr = dArr.map((it, id) => ({ ...it, id, key: id }));

      //  showLog({ mData });
      setData(dArr);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showWarn(e);
    }
  };

  const initData = () => {
    _initData(initValues);
    setReady(true);
  };

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = useCallback(headerChange => {
    let change = firstKey(headerChange);
    //  showLog({ headerChange, change });
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
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = rec => {
    setModal({ record: rec, visible: true });
  };

  const onCancelConfirm = async canceled => {
    try {
      load(true);
      const updateRef = firestore.collection('sections/sales/bookings').doc(bModal.record.bookId);
      const isEdit = !!bModal.record?.canceled && bModal.record.canceled?.date;
      if (isEdit) {
        let oCanceled = { ...bModal.record?.canceled };
        delete oCanceled.editedBy;
        let changes = getChanges(canceled, oCanceled);
        let editedBy = !!bModal.record.canceled?.editedBy
          ? [...bModal.record.canceled.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
        let mCancel = {
          ...canceled,
          editedBy,
          by: user?.employeeCode || user.uid
        };
        await updateRef.update({ canceled: mCancel });
      } else {
        await updateRef.update({
          canceled: { ...canceled, by: user?.employeeCode || user.uid }
        });
      }
      load(false);
      showSuccess(
        () => {
          setModal({ record: {}, visible: false });
          _initData({
            branch: branchRef.current,
            duration: durationRef.current
          });
        },
        `บันทึกการยกเลิกใบจองเลขที่ ${bModal.record.bookNo} สำเร็จ`,
        true
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    setSearchText(txt);
    _search(txt);
  }, 200);

  const _search = async txt => {
    try {
      if (!txt || (txt && txt.length < 3)) {
        setLoading(false);
        return setData([]);
      }
      // let arr = searchArr(dataRef.current, txt, ['pCode', 'name']);
      let wheres = [['canceled', '==', null]];
      setLoading(true);
      // const arr = await fetchFirestoreKeywords(fProps);
      let searchRef = firestore.collection('sections/sales/bookings');
      if (wheres) {
        wheres.map(wh => {
          // console.log({ wh });
          searchRef = searchRef.where(wh[0], wh[1], wh[2]);
          return wh;
        });
      }

      let dataArr = [];
      let result = [];
      let searchFields = ['bookNo', 'firstName'];
      await arrayForEach(searchFields, async field => {
        const arr = await fetchSearchsEachField(txt, field, searchRef, [
          'bookNo',
          'firstName',
          'date',
          'saleType',
          'prefix',
          'firstName',
          'lastName',
          'amtReceived',
          'amtFull',
          'branchCode',
          'canceled',
          'deleted'
        ]);
        dataArr = dataArr.concat(arr);
      });
      await arrayForEach(dataArr, async it => {
        const doc = await checkDoc('sections', `sales/bookings/${it._id}`);
        if (doc) {
          result.push(doc.data());
        }
      });
      setLoading(false);
      setData(
        sortArr(result, '-date').map((l, i) => ({
          ...l,
          id: i,
          key: i
        }))
      );
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  showLog({ data });
  return (
    <Container fluid className="main-content-container p-3">
      <div className="px-3 bg-white border-bottom">
        <PageHeader
          title="ยกเลิกใบจอง"
          subtitle="งานขาย"
          hasBranch
          hasAllBranch
          hasDuration
          // hasAllDate
          onChange={_onValuesChange}
          defaultBranch={initValues.branch}
          defaultDuration="thisWeek"
        />
      </div>
      <div className="p-3">
        <Row>
          <Col md="7">
            <Search
              placeholder="พิมพ์เพื่อค้นหา เลขที่ใบจอง / ชื่อลูกค้า"
              // onSearch={debounceSearch}
              onChange={e => _onSearch(e)}
              enterButton
              allowClear
            />
          </Col>
        </Row>
      </div>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={8}
            sumKeys={['amtReceived', 'amtFull']}
          />
        )}
        handleEdit={handleSelect}
        hasEdit
        rowClassName={(record, index) =>
          record?.deleted
            ? 'deleted-row'
            : record?.canceled && !!record.canceled?.date
              ? 'recorded-row'
              : 'editable-row'
        }
        pagination={{ pageSize: 100 }}
        scroll={{ y: h(80) }}
      />
      <Modal
        title={`${bModal.record.bookNo} | ${`${bModal.record.prefix || ''}${
          bModal.record.firstName || ''
        } ${bModal.record.lastName || ''}`} | จอง ${numeral(bModal.record.amtReceived).format('0,0.00')} บาท`}
        visible={bModal.visible}
        onCancel={() => setModal({ visible: false, record: {} })}
        footer={[
          <Button key="close" onClick={() => setModal({ visible: false, record: {} })}>
            ปิด
          </Button>
        ]}
        cancelText="ปิด"
        width={isMobile ? '90vw' : '77vw'}
        bodyStyle={{ height: '75vh', overflowY: 'scroll' }}
        style={{ left: isMobile ? 0 : w(7) }}
        destroyOnClose
      >
        <CancelModal
          {...{
            record: bModal.record,
            grant: true,
            readOnly: true,
            onConfirm: val => onCancelConfirm(val)
          }}
        />
      </Modal>
    </Container>
  );
};
