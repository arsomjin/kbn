import { PlusOutlined } from '@ant-design/icons';
import { Collapse, Form } from 'antd';
import PageTitle from 'components/common/PageTitle';
import EditableCellTable from 'components/EditableCellTable';
import Footer from 'components/Footer';
import { FirebaseContext } from '../../../../firebase';
import { showWarn } from 'functions';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'shards-react';
import { renderInput, columns } from './api';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const _onValuesChange = val => {};

  const _onConfirm = currentValues => {};

  const _resetToInitial = () => {};

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
      //   await api.updateItem(newValues, 'sections/stocks/decal', newValues._key);
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
      //     'sections/stocks/decal',
      //     nData[index]._key
      //   );
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          model: null
        }}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white">
                <PageTitle sm="8" title="ทะเบียนคุมลอกลายรถ" subtitle="งานคลังสินค้า" className="text-sm-left" />
              </div>
              <Collapse>
                <Collapse.Panel header="บันทึกข้อมูล" key="1">
                  {renderInput(values)}
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
      <EditableCellTable
        dataSource={data}
        columns={columns}
        onUpdate={onUpdate}
        onDelete={onDelete}
        loading={loading}
      />
    </Container>
  );
};
