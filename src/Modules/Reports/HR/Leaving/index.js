import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Form } from 'antd';
import EditableCellTable from 'components/EditableCellTable';
import { FirebaseContext } from '../../../../firebase';
import { showWarn } from 'functions';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import { getColumns, getInitialValues } from './api';
import BranchDateHeader from 'components/branch-date-header';
import { showLog } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import moment from 'moment-timezone';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import { uniq } from 'lodash';
import { showSuccess } from 'functions';
import EditLeave from './EditLeave';
import { getNameFromUid } from 'Modules/Utils';
import { showAlert } from 'functions';
import { ExtraPositions } from 'data/Constant';
import { Check } from '@material-ui/icons';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { getDates } from 'functions';
import { h } from 'api';
import { queryFirestoreArrayContainAny } from 'utils';

export default () => {
  const initRange = useMemo(
    () => [
      // moment().subtract(7, 'day').format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    ],
    []
  );

  const { api } = useContext(FirebaseContext);

  const { user } = useSelector(state => state.auth);
  const { employees, users } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lModal, setModal] = useMergeState({ record: {}, visible: false });

  // Ref to store search parameters without triggering re-renders
  const searchValues = useRef({
    branchCode: user?.branch || '0450',
    date: initRange
  });

  let POSITIONS = uniq(
    Object.keys(employees)
      .map(k => employees[k].position)
      .filter(l => !!l)
  );

  POSITIONS = (POSITIONS || []).concat(ExtraPositions);

  const handleValuesChange = useCallback(async changedValues => {
    searchValues.current = { ...searchValues.current, ...changedValues };
    setData([]);
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      showLog({ val: searchValues.current });
      setLoading(true);
      const dateRange = getDates(searchValues.current.date[0], searchValues.current.date[1], 'YYYY-MM-DD');
      let wheres = [];
      if (searchValues.current.branchCode !== 'all') {
        wheres = wheres.concat([['branchCode', '==', searchValues.current.branchCode]]);
      }

      const items = await queryFirestoreArrayContainAny('dates', dateRange, 'sections/hr/leave', wheres);

      let arr = items.map((it, key) => ({
        ...it,
        id: key,
        key
      }));
      setData(arr);
      setLoading(false);
    } catch (error) {
      showWarn(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const _onEdit = async editValues => {
    try {
      setLoading(true);
      let nValues = { ...editValues };
      delete nValues.id;
      delete nValues.key;
      await api.updateItem(nValues, 'sections/hr/leave', nValues._id);
      setModal({ record: {}, visible: false });
      showSuccess(() => showLog('Success editing', editValues), 'บันทึกข้อมูลสำเร็จ', true);

      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const handleSelect = rec => {
    if (rec.deleted) {
      if (rec.editedBy) {
        let lastEditor = getNameFromUid({
          uid: rec.editedBy[rec.editedBy.length - 1].uid,
          users,
          employees
        });
        let ts = rec.editedBy[rec.editedBy.length - 1].time;
        showAlert('ลบรายการแล้ว', `โดย ${lastEditor} วันที่ ${moment.tz(ts, 'Asia/Bangkok').format('lll')}`, 'warning');
      }
      return;
    }
    setModal({ record: rec, visible: true });
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={getInitialValues(searchValues.current)}
        // layout="vertical"
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
      >
        {values => {
          showLog({ values });
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <div className="px-3 bg-white border-bottom">
              <Row>
                <Col md="12">
                  <BranchDateHeader
                    title="ลางาน"
                    subtitle="รายงาน งานบุคคล"
                    // disableAllBranches
                    dateLabel="วันที่ลา"
                    dateRequired
                    branchRequired
                    extraComponent={
                      <div className={!isMobile ? 'mt-4' : undefined}>
                        <Button
                          onClick={handleUpdate}
                          disabled={loading}
                          type="primary"
                          icon={<Check />}
                          loading={loading}
                          className="mr-2"
                          style={{ width: 120 }}
                          size="middle"
                        >
                          {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                        </Button>
                      </div>
                    }
                    disabled={loading}
                    onlyUserBranch={user.branch}
                    isRange
                  />
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
            </div>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={getColumns(searchValues.current.branchCode === 'all')}
        // onUpdate={onUpdate}
        // onDelete={onDelete}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        hasEdit
        loading={loading}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
        scroll={{ y: h(80) }}
      />
      <EditLeave
        selectedData={lModal.record}
        visible={lModal.visible}
        onOk={_onEdit}
        onCancel={() => setModal({ record: {}, visible: false })}
        POSITIONS={POSITIONS}
      />
    </Container>
  );
};
