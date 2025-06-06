import PageTitle from 'components/common/PageTitle';
import { FirebaseContext } from '../../firebase';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Container, Fade, Row, Col, CardBody, CardHeader } from 'shards-react';
import { Input, Modal } from 'antd';
import { ListItem, Button } from 'elements';
import { searchArr } from 'functions';
import { debounce } from 'lodash';
import { useCollectionListener } from 'api/CustomHooks';
import EditableRowTable from 'components/EditableRowTable';
import { getColumns } from './api';
import { isMobile } from 'react-device-detect';
import { h } from 'api';
import { w } from 'api';
import EmployeeProfile from './components/EmployeeProfile';
import { AddButton } from 'elements';
const { Search } = Input;

export default () => {
  const { app, api } = useContext(FirebaseContext);

  const [selected, setSelected] = useState({});
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState([]);

  const dataRef = useRef([]);

  useEffect(() => {
    api.getEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const EMPLOYEES = useCollectionListener('data/company/employees');

  const _getData = useCallback(arrEmployees => {
    const allEmployees = Object.keys(arrEmployees).map(k => ({
      ...arrEmployees[k]
    }));
    return allEmployees.map((it, id) => ({ ...it, id, key: id }));
  }, []);

  useEffect(() => {
    const arr = _getData(EMPLOYEES.data);
    setData(arr);
    dataRef.current = arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EMPLOYEES.data]);

  const handleSelect = record => {
    //  showLog({ record });
    const grant = true;
    // (user.permissions &&
    //   (user.permissions.permission701 || user.permissions.permission702)) ||
    // user.isDev;
    if (!grant) {
      // Not allowed.
      return;
    }
    setIsEdit(true);
    setSelected({ ...record, status: record?.status || 'ปกติ' });
    setShow(true);
  };

  const _search = txt => {
    let arr = searchArr(dataRef.current, txt, ['firstName', 'lastName', 'employeeCode']);
    setData(arr.map((it, id) => ({ ...it, id, key: id })));
  };

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    if (!txt || txt.length === 0) {
      const arr = _getData(EMPLOYEES.data);
      setData(arr);
      return;
    }
    _search(txt);
  }, 200);

  const _add = () => {
    const record = {
      prefix: 'นาย',
      firstName: '',
      lastName: '',
      employeeCode: '',
      status: 'ปกติ',
      nickName: '',
      position: '',
      affiliate: '',
      description: '',
      workBegin: undefined,
      workEnd: undefined
    };
    setIsEdit(false);
    setSelected({ ...record, status: record?.status || 'ปกติ' });
    setShow(true);
  };

  const expandedRowRender = record => {
    return (
      <div className="bg-light bordered pb-1">
        {record.nickName && <ListItem label="ชื่อเล่น" info={record.nickName} />}
        {record.employeeCode && <ListItem label="รหัสพนักงาน" info={record.employeeCode} />}
      </div>
    );
  };

  return (
    <Container fluid className="main-content-container px-4">
      <Row form className="page-header py-4 align-items-center">
        <PageTitle sm="3" title="รายชื่อพนักงาน" subtitle="Employees" className="text-sm-left" />
      </Row>
      <Row className="mb-3" style={{ alignItems: 'center' }}>
        <Col md="1" className={isMobile ? 'mb-3' : ''}>
          <AddButton onClick={_add} />
        </Col>
        <Col md="6">
          <Fade>
            <Search
              placeholder="พิมพ์เพื่อค้นหา ชื่อ / นามสกุล / รหัสพนักงาน"
              // onSearch={onSearch}
              onChange={_onSearch}
              enterButton
              allowClear
            />
          </Fade>
        </Col>
      </Row>
      <EditableRowTable
        title={() => <h6 className="m-0 text-success">รายชื่อ</h6>}
        dataSource={data}
        columns={getColumns(data)}
        expandable={
          isMobile && {
            expandedRowRender,
            rowExpandable: record => record.name !== 'Not Expandable'
          }
        }
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        loading={EMPLOYEES.loading}
        scroll={{ y: h(60) }}
        pagination={{ pageSize: 10 }}
        rowClassName={(record, index) => (record.status === 'ลาออก' ? 'rejected-row' : undefined)}
      />
      {show && selected && (
        <Modal
          visible={show && selected}
          width={isMobile ? w(92) : w(77)}
          style={{ left: isMobile ? 0 : w(8) }}
          onCancel={() => setShow(false)}
          footer={[]}
          destroyOnClose
        >
          <CardHeader className="border-bottom">
            <Row form style={{ alignItems: 'center' }}>
              <Button onClick={() => setShow(false)} className="btn-white">
                &larr; กลับ
              </Button>
              <div
                className="ml-sm-auto mt-2"
                style={{
                  justifyContent: 'flex-end',
                  marginRight: '10px'
                }}
              >
                <h6 className="text-primary ml-3">{selected?.displayName || ''}</h6>
              </div>
            </Row>
          </CardHeader>
          <CardBody className="p-0 pb-3">
            <EmployeeProfile
              selectedEmployee={selected}
              onCancel={() => setShow(false)}
              app={app}
              api={api}
              isEdit={isEdit}
            />
          </CardBody>
        </Modal>
      )}
    </Container>
  );
};
