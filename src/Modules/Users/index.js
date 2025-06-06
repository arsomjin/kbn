import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Modal, Input } from 'antd';
import { useCollectionListener, useMergeState } from 'api/CustomHooks';
import EditableRowTable from 'components/EditableRowTable';
import { FirebaseContext } from '../../firebase';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';
import { CardHeader, Container, Row, CardBody, Col } from 'shards-react';
import UserProfile from './components/UserProfile';
import { Button, ListItem } from 'elements';
import { Fade } from 'react-awesome-reveal';
import { w } from 'api';
import PageTitle from 'components/common/PageTitle';
import debounce from 'lodash/debounce';
import { columns, columns_mobile } from './api';
import { searchArr, showWarn, load, arrayForEach, showLog } from 'functions';
import { getEmployeeStatus } from 'utils';
import { checkDoc } from 'firebase/api';
import moment from 'moment-timezone';

const { Search } = Input;

export default function UserManagement() {
  const { app, api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { branches, departments, users } = useSelector(state => state.data);

  // Use `null` for no selection
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [arrStatus, setStatus] = useMergeState({
    all: [],
    online: [],
    offline: []
  });

  const updateUserState = async userObj => {
    try {
      const usrArr = Object.keys(userObj).map(k => ({
        ...userObj[k],
        _key: k
      }));
      await arrayForEach(usrArr, async usr => {
        const stateDoc = await checkDoc('status', usr._key);
        if (stateDoc) {
          const data = stateDoc.data() || {};
          const lastActive = data.lastActive || data.last_online;
          const isActive = moment(lastActive).isAfter(moment().subtract(1, 'hour'));
          await api.updateItem({ state: isActive ? 'online' : 'offline' }, 'status', usr._key);
        }
      });
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    api.getUsers();
    updateUserState(users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineStatusListener = useCollectionListener('status');
  const usersListener = useCollectionListener('users');

  const _getData = useCallback(
    (arrOnline, arrUsers) => {
      const allUsers = Object.keys(arrUsers.data).map(k => {
        const userData = arrUsers.data[k];
        const branchCode = userData?.branch || null;
        const branchName = branches[branchCode]?.branchName || '';
        const departmentCode = userData?.department || null;
        const departmentName = departments[departmentCode]?.department || '';
        const status = users[k]?.status || 'ปกติ';
        return {
          ...arrOnline.data[k],
          ...userData,
          ...(userData?.auth && {
            prefix: userData.auth.prefix,
            firstName: userData.auth.firstName,
            lastName: userData.auth.lastName,
            email: userData.auth.email,
            phoneNumber: userData.phoneNumber || userData.auth.phoneNumber || null,
            nickName: userData.nickName || userData.auth.nickName || null,
            userGroup: userData.group || userData.auth.group || null,
            displayName: userData.auth.displayName,
            status
          }),
          branchCode,
          branchName,
          departmentName
        };
      });

      const filters = user?.isDev
        ? allUsers
        : allUsers.filter(l => l.userGroup !== 'group001' && !l.isDev && !l.isHidden);

      const online = filters.filter(l => l.state === 'online').map((it, id) => ({ ...it, id, key: id }));
      const offline = filters
        .filter(l => online.findIndex(it => it._key === l._key) === -1 && l.status !== 'ลาออก')
        .map((it, id) => ({ ...it, id, key: id }));

      const resignedOnline = filters.filter(l => l.status === 'ลาออก' && l.state === 'online');

      return { online, offline, all: filters, RESIGNED_ONLINE: resignedOnline };
    },
    [branches, departments, user.isDev, users]
  );

  useEffect(() => {
    const data = _getData(onlineStatusListener, usersListener);
    setStatus(data);
    if (data.RESIGNED_ONLINE.length > 0) {
      handleAnomalyState(data.RESIGNED_ONLINE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineStatusListener, usersListener]);

  useEffect(() => {
    // Update user state every hour (3600000 ms)
    const intervalId = setInterval(() => {
      showLog({ UPDATE_USER_STATE: usersListener });
      updateUserState(usersListener.data);
    }, 3600000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersListener]);

  const handleAnomalyState = async anArr => {
    try {
      await arrayForEach(anArr, async usr => {
        const stateDoc = await checkDoc('status', usr._key);
        if (stateDoc) {
          await api.updateItem({ state: 'offline', last_offline: Date.now() }, 'status', usr._key);
        }
      });
    } catch (e) {
      showWarn(e);
    }
  };

  const handleSelect = async record => {
    try {
      load(true);
      let snap = { ...record };
      const status = await getEmployeeStatus(record);
      snap = { ...snap, status };
      const grant = true; // TODO: Add permission checks if needed
      if (!grant) return;
      load(false);
      setSelected(snap);
      setShow(true);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _search = txt => {
    const filtered = searchArr(arrStatus.all, txt, ['firstName', 'lastName', 'email', 'branchName', 'departmentName']);
    const online = filtered.filter(l => l.state === 'online').map((it, id) => ({ ...it, id, key: id }));
    const offline = filtered
      .filter(l => online.findIndex(it => it._key === l._key) === -1)
      .map((it, id) => ({ ...it, id, key: id }));
    setStatus({ online, offline });
  };

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    if (!txt) {
      const data = _getData(onlineStatusListener, usersListener);
      setStatus(data);
      return;
    }
    _search(txt);
  }, 200);

  const expandedRowRender = record => (
    <div className="bg-light bordered pb-1">
      {record.branch && branches[record.branch] && <ListItem label="สาขา" info={branches[record.branch].branchName} />}
      {record.email && <ListItem label="อีเมล" info={record.email} />}
      {record.phoneNumber && <ListItem label="เบอร์โทร" info={record.phoneNumber} />}
    </div>
  );

  return (
    <Container fluid className="main-content-container px-4">
      {/* Page Header */}
      <Row form className="page-header py-4 align-items-center">
        <PageTitle sm="3" title="รายชื่อผู้ใช้งานระบบ" subtitle="Users" className="text-sm-left" />
      </Row>
      <Row className="mb-3">
        <Col md="6">
          <Fade>
            <Search
              placeholder="พิมพ์เพื่อค้นหา ชื่อ / นามสกุล / อีเมล / สาขา / แผนก"
              onChange={_onSearch}
              enterButton
              allowClear
            />
          </Fade>
        </Col>
      </Row>
      <EditableRowTable
        title={() => <h6 className="m-0 text-success">Online</h6>}
        dataSource={arrStatus.online}
        columns={isMobile ? columns_mobile : columns}
        expandable={
          isMobile && {
            expandedRowRender,
            rowExpandable: record => record.name !== 'Not Expandable'
          }
        }
        onRow={record => ({
          onClick: () => handleSelect(record)
        })}
        rowClassName={record => (record.status === 'ลาออก' ? 'deleted-row' : undefined)}
        loading={onlineStatusListener.loading || usersListener.loading}
      />
      <EditableRowTable
        title={() => <h6 className="m-0 text-muted">Offline</h6>}
        dataSource={arrStatus.offline}
        columns={isMobile ? columns_mobile : columns}
        expandable={
          isMobile && {
            expandedRowRender,
            rowExpandable: record => record.name !== 'Not Expandable'
          }
        }
        onRow={record => ({
          onClick: () => handleSelect(record)
        })}
        rowClassName={record => (record.status === 'ลาออก' ? 'deleted-row' : 'table-secondary')}
        loading={onlineStatusListener.loading || usersListener.loading}
      />
      {show && selected && (
        <Modal
          visible={show}
          width={isMobile ? w(92) : w(77)}
          style={{ left: isMobile ? 0 : w(8) }}
          onCancel={() => setShow(false)}
          footer={null}
        >
          <CardHeader className="border-bottom">
            <Row form style={{ alignItems: 'center' }}>
              <Button onClick={() => setShow(false)} className="btn-white">
                &larr; กลับ
              </Button>
              <div className="ml-sm-auto mt-2" style={{ marginRight: '10px' }}>
                <h6 className="text-primary ml-3">{selected?.displayName || ''}</h6>
              </div>
            </Row>
          </CardHeader>
          <CardBody className="p-0 pb-3">
            <UserProfile selectedUser={selected} onCancel={() => setShow(false)} app={app} api={api} />
          </CardBody>
        </Modal>
      )}
    </Container>
  );
}
