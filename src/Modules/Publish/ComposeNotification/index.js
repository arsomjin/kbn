import React, { useCallback, useContext } from 'react';
import { Container, Row, Col } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import Editor from './add-new-notification/Editor';
import SidebarActions from './add-new-notification/SidebarActions';
import SidebarCategories from './add-new-notification/SidebarCategories';
import { Form } from 'antd';
import HiddenItem from 'components/HiddenItem';
import { getRules } from 'api/Table';
import { useMergeState } from 'api/CustomHooks';
import { showWarn } from 'functions';
import { removeTags } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { composeNotification } from 'api/NotificationsUnified';

const AddNewNotification = () => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const [form] = Form.useForm();

  const [cState, setCState] = useMergeState({
    messageError: null,
    descriptionError: null
  });

  const _onTitleChange = useCallback(
    message => {
      form.setFieldsValue({ message });
      setCState({ messageError: null });
    },
    [form, setCState]
  );
  const _onBodyChange = useCallback(
    description => {
      form.setFieldsValue({ description });
      setCState({ descriptionError: null });
    },
    [form, setCState]
  );

  const onPublish = useCallback(async () => {
    try {
      const values = await form.validateFields();
      //  showLog({ values });
      if (values.description && !removeTags(values.description).trim()) {
        form.setFieldsValue({ description: '' });
        return setCState({ descriptionError: 'กรุณาป้อนข้อมูล' });
      }
      // notif = {
      //     message: 'ทดสอบการแจ้งเตือน',
      //     description: 'สมุทรปราการ โป๊ะแตก วันเดียวพบติดเชื้อโควิดใหม่ 20 ราย แบ่งเป็นคลัสเตอร์จากโรงงานย่านพระสมุทรเจดีย์ 11 ราย - ผับย่านทองหล่อ 9 ราย เร่งสอบสวนโรค - คัดกรองกลุ่มเสี่ยง - เช็กไทม์ไลน์ผู้ป่วย...',
      //     duration: '0',
      //     type: 'info' 'warning' 'success' 'error',
      //     branch: '1002',
      //     department: 'dep0003',
      //     group: group001',
      //     by: user.uid,
      //     link: 'https://www.dailynews.co.th/regional/835737',
      //   },

      let mValues = { ...values };
      Object.keys(values).map(k => {
        if (values[k] === 'all') {
          delete mValues[k];
        }
        return values[k];
      });
      if (!values.link) {
        delete mValues.link;
      }
      //  showLog({ mValues });

      let notif = {
        ...mValues,
        duration: mValues.duration.toString(),
        by: user.uid,
        time: Date.now().toString()
      };
      //   openNotification(notif);
      await composeNotification(api, notif);
      showSuccess(() => form.resetFields(), 'ส่งการแจ้งเตือน สำเร็จ');
    } catch (e) {
      showWarn(e);
      if (e.errorFields) {
        e.errorFields.map(l => {
          setCState({ [`${l.name[0]}Error`]: l.errors[0] });
          return l;
        });
      }
    }
  }, [api, form, setCState, user.uid]);

  return (
    <Container fluid className="main-content-container px-4 pb-4">
      {/* Page Header */}
      <Row noGutters className="page-header py-4">
        <PageTitle sm="4" title="เผยแพร่การแจ้งเตือน" subtitle="Publish New Notification" className="text-sm-left" />
      </Row>
      <Form
        form={form}
        onFinish={onPublish}
        initialValues={{
          message: '',
          description: '',
          group: 'all',
          department: 'all',
          branch: 'all',
          type: 'info',
          duration: 5,
          link: ''
        }}
      >
        {(values, { getFieldsError }) => {
          //  showLog({ values });
          return (
            <Row>
              <HiddenItem name="message" rules={getRules(['required'])} />
              <HiddenItem name="description" required />
              {/* Editor */}
              <Col lg="9" md="12">
                <Editor
                  title={values.message}
                  body={values.description}
                  onTitleChange={_onTitleChange}
                  onBodyChange={_onBodyChange}
                  titleError={cState.messageError}
                  bodyError={cState.descriptionError}
                />
              </Col>

              {/* Sidebar Widgets */}
              <Col lg="3" md="12">
                <SidebarCategories title="กลุ่มที่ต้องการส่ง" />
                <SidebarActions onPublish={onPublish} values={values} />
              </Col>
            </Row>
          );
        }}
      </Form>
    </Container>
  );
};

export default AddNewNotification;
