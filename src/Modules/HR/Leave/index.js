import { PlusOutlined } from '@ant-design/icons';
import { Collapse, Form, Skeleton } from 'antd';
import EditableCellTable from 'components/EditableCellTable';
import Footer from 'components/Footer';
import { FirebaseContext } from '../../../firebase';
import { showWarn } from 'functions';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row } from 'shards-react';
import { renderInput, columns, getInitialValues } from './api';
import BranchDateHeader from 'components/branch-date-header';
import { CommonSteps } from 'data/Constant';
import { showLog } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';
import { createNewOrderId } from 'Modules/Account/api';
import { useMergeState } from 'api/CustomHooks';
import moment from 'moment-timezone';
import { waitFor } from 'functions';
import { firstKey } from 'functions';
import { NotificationIcon } from 'elements';
import { getEditArr } from 'utils';
import { uniq } from 'lodash';
import { cleanValuesBeforeSave } from 'functions';
import { load } from 'functions';
import { showSuccess } from 'functions';
import { getNameFromEmployeeCode } from 'Modules/Utils';
import EditLeave from './EditLeave';
import { getNameFromUid } from 'Modules/Utils';
import { showAlert } from 'functions';
import { ExtraPositions } from 'data/Constant';
import { Numb } from 'functions';

const initProps = {
  readOnly: false,
  grant: true,
  onBack: null,
  activeStep: 0,
  branchCode: null,
  date: null
};

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  const { user } = useSelector(state => state.auth);
  const { employees, users } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [branch, setBranch] = useState(user?.branch || '0450');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lModal, setModal] = useMergeState({ record: {}, visible: false });

  let POSITIONS = uniq(
    Object.keys(employees)
      .map(k => employees[k].position)
      .filter(l => !!l)
  );

  POSITIONS = (POSITIONS || []).concat(ExtraPositions);

  useEffect(() => {
    const { onBack } = params || {};

    if (!!params?.branchCode) {
      setProps({
        branchCode: params.branchCode,
        date: params.date,
        activeStep: 1,
        onBack
      });
      setBranch(params.branchCode);
      setDate(params.date);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const _resetToInitial = async () => {
    form.resetFields();
    await waitFor(0);
    form.setFieldsValue({
      ...getInitialValues(user),
      branchCode: branch,
      date
    });
    setBranch(branch);
    setDate(date);
  };

  useEffect(() => {
    const handleUpdates = snap => {
      setLoading(true);
      let items = [];
      snap.forEach(doc => {
        items.push({
          ...doc.data(),
          id: items.length,
          key: items.length,
          _id: doc.id
        });
      });
      //  showLog({ items });
      setData(items);
      setLoading(false);
    };
    let query = firestore.collection('sections').doc('hr').collection('leave').where('date', '==', date);
    if (branch !== 'all') {
      query = query.where('branchCode', '==', branch);
    }
    let unsubscribe;
    unsubscribe = query.onSnapshot(handleUpdates, err => showLog(err));
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [api, branch, date, firestore]);

  const _onValuesChange = val => {
    const changeKey = firstKey(val);
    if (changeKey === 'employeeId') {
      !!employees[val['employeeId']]?.position &&
        form.setFieldsValue({
          position: employees[val['employeeId']]?.position
        });
    } else if (changeKey === 'date') {
      setDate(val['date']);
    } else if (changeKey === 'branchCode') {
      setBranch(val['branchCode']);
    } else if (changeKey === 'leaveDays') {
      let fromDate = form.getFieldValue('fromDate');
      !!fromDate &&
        !!val[changeKey] &&
        Numb(val[changeKey]) >= 1 &&
        form.setFieldsValue({
          toDate: moment(fromDate, 'YYYY-MM-DD').add(val[changeKey] - 1, 'day')
        });
    } else if (changeKey === 'fromDate') {
      let leaveDays = form.getFieldValue('leaveDays');
      !!leaveDays &&
        Numb(leaveDays) >= 1 &&
        form.setFieldsValue({
          toDate: moment(val[changeKey], 'YYYY-MM-DD').add(leaveDays - 1, 'day')
        });
    }
  };

  const _onConfirm = async currentValues => {
    try {
      load(true);
      let values = await form.validateFields();
      let docId = createNewOrderId('HR-LEAVE');
      let sValues = cleanValuesBeforeSave({
        ...currentValues,
        branchCode: branch,
        date,
        docId
      });
      await api.setItem(
        {
          ...sValues,
          deleted: false,
          created: Date.now(),
          inputBy: user.uid
        },
        'sections/hr/leave',
        docId
      );
      load(false);
      _resetToInitial();
      showSuccess(
        () => showLog('Success'),
        `บันทึกการลางาน ${getNameFromEmployeeCode({
          employeeCode: sValues.employeeId,
          employees
        })} สำเร็จ`
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

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

  const onUpdate = async row => {
    try {
      //  showLog('save', row);
      if (row.deleted) {
        return;
      }
      setLoading(true);
      let nValues = { ...row };
      delete nValues.id;
      //   let newValues = checkEditRecord(nValues, data, user);
      //   await api.updateItem(newValues, 'sections/hr/leave', newValues._key);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const onDelete = async key => {
    try {
      setLoading(true);
      let nData = [...data];
      let index = nData.findIndex(item => item.key === key);
      //  showLog('deleted', nData[index]);
      let nValues = { ...nData[index], deleted: true };
      delete nValues.id;
      //   const newValues = checkEditRecord(nValues, data, user);
      //   await api.updateItem(
      //     newValues,
      //     'sections/hr/leave',
      //     nData[index]._key
      //   );
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

  if (!ready) {
    return <Skeleton active />;
  }

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={getInitialValues(user, mProps.order)}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          //  showLog({ values });
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <>
              <div className="px-3 bg-white">
                <BranchDateHeader
                  title="ลางาน"
                  subtitle="งานบุคคล"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={mProps.activeStep}
                  branchRequired
                  dateRequired
                  dateLabel="วันที่บันทึก"
                />
              </div>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput({ POSITIONS, values })}
                  <Footer
                    onConfirm={() => _onConfirm(values)}
                    onCancel={() => _resetToInitial()}
                    cancelText="ล้างข้อมูล"
                    cancelPopConfirmText="ล้าง?"
                    okPopConfirmText="ยืนยัน?"
                    okIcon={<PlusOutlined />}
                  />
                </Collapse.Panel>
              </Collapse>
            </>
          );
        }}
      </Form>
      <div className="mt-3" />
      <EditableCellTable
        dataSource={data}
        columns={columns}
        // onUpdate={onUpdate}
        // onDelete={onDelete}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        hasEdit
        loading={loading}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
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
