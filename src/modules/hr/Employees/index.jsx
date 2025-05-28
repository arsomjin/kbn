import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Modal } from 'antd';
import { debounce } from 'lodash';
import { useCollectionListener } from 'api/CustomHooks';
import { useAuth } from '../../../contexts/AuthContext';
import { useModal } from '../../../contexts/ModalContext';
import { useResponsive } from 'hooks/useResponsive';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from 'constants/Permissions';
import { searchArr } from 'utils/array';
import PageTitle from 'components/common/PageTitle';
import { AddButton } from 'elements';
import EditableRowTable from 'components/EditableRowTable';
import { getColumns } from './api';
import { EmployeeProfile } from './components/EmployeeProfile';
import { ListItem } from 'elements';
import { prepareDataFromFirestore } from '../../../utils/firestoreUtils';
import { useParams } from 'react-router';
import { ROLES, ROLE_HIERARCHY } from 'constants/roles';

const { Search } = Input;

export const Employees = () => {
  const { t } = useTranslation('employees');
  const { showModal } = useModal();
  const { isMobile } = useResponsive();
  const { userProfile } = useAuth();
  const { hasPermission, hasProvinceAccess, userRole } = usePermissions();
  const { provinceId, branchCode } = useParams();

  const [selected, setSelected] = useState({});
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState([]);

  const dataRef = useRef([]);

  const EMPLOYEES = useCollectionListener('data/company/employees', [
    ['provinceId', '==', userProfile?.province || userProfile?.provinceId],
    ['status', '!=', 'ลาออก'],
  ]);

  console.log('EMPLOYEES', { EMPLOYEES });

  const userBranch = userProfile?.branch || userProfile?.branchCode;
  const userProvince = userProfile?.provinceId || userProfile?.province;
  const userRoleKey = userProfile?.role || userRole;

  // Only allow access for branch_manager and above
  const isBranchManagerOrAbove =
    ROLE_HIERARCHY[userRoleKey] !== undefined &&
    ROLE_HIERARCHY[userRoleKey] <= ROLE_HIERARCHY[ROLES.BRANCH_MANAGER];

  // RBAC: Only show data if user has EMPLOYEE_VIEW and province access and is branch_manager or above
  const canViewEmployees =
    isBranchManagerOrAbove &&
    hasPermission(PERMISSIONS.EMPLOYEE_VIEW) &&
    hasProvinceAccess(provinceId || userProvince);
  const canAddEmployee =
    isBranchManagerOrAbove &&
    hasPermission(PERMISSIONS.EMPLOYEE_CREATE) &&
    hasProvinceAccess(provinceId || userProvince);

  // Filter employees list depending on user scope
  const _getData = useCallback(
    (arrEmployees) => {
      const allEmployees = Object.keys(arrEmployees).map((k) => ({
        ...arrEmployees[k],
      }));
      // Executive, Super Admin, Developer, General Manager: see all
      if (
        [ROLES.EXECUTIVE, ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.GENERAL_MANAGER].includes(
          userRoleKey,
        )
      ) {
        return allEmployees.map((it, id) => ({ ...it, id, key: id }));
      }
      // Province Admin/Manager: see only employees in their province(s)
      if ([ROLES.PROVINCE_ADMIN, ROLES.PROVINCE_MANAGER].includes(userRoleKey)) {
        return allEmployees
          .filter((it) => it.provinceId === userProvince)
          .map((it, id) => ({ ...it, id, key: id }));
      }
      // Branch Manager: see only employees in their branch
      if (userRoleKey === ROLES.BRANCH_MANAGER) {
        return allEmployees
          .filter(
            (it) =>
              it.provinceId === userProvince &&
              (it.branch === userBranch || it.branchCode === userBranch),
          )
          .map((it, id) => ({ ...it, id, key: id }));
      }
      // Others: no access
      return [];
    },
    [userRoleKey, userProvince, userBranch],
  );

  useEffect(() => {
    const arr = _getData(EMPLOYEES.data);
    setData(arr);
    dataRef.current = arr;
  }, [EMPLOYEES.data, _getData]);

  const handleSelect = (record) => {
    if (
      !hasPermission(PERMISSIONS.EMPLOYEE_VIEW) ||
      !hasProvinceAccess(record.provinceId || record.province)
    ) {
      showModal({
        type: 'error',
        title: t('messages.error.permissionDenied'),
        content: t('messages.error.insufficientPermissions'),
      });
      return;
    }
    setIsEdit(true);
    const safeData = prepareDataFromFirestore(record);
    setSelected({ ...safeData, status: record?.status || t('status.active') });
    setShow(true);
  };

  const _search = (txt) => {
    let arr = searchArr(dataRef.current, txt, ['firstName', 'lastName', 'employeeCode']);
    setData(arr.map((it, id) => ({ ...it, id, key: id })));
  };

  const _onSearch = debounce((ev) => {
    const txt = ev.target.value;
    if (!txt || txt.length === 0) {
      const arr = _getData(EMPLOYEES.data);
      setData(arr);
      return;
    }
    _search(txt);
  }, 200);

  const _add = () => {
    if (!canAddEmployee) {
      showModal({
        type: 'error',
        title: t('messages.error.permissionDenied'),
        content: t('messages.error.insufficientPermissions'),
      });
      return;
    }
    const record = {
      prefix: t('prefix.mr'),
      firstName: '',
      lastName: '',
      employeeCode: '',
      status: t('status.active'),
      nickName: '',
      position: '',
      affiliate: '',
      description: '',
      workBegin: undefined,
      workEnd: undefined,
      provinceId: provinceId || userProfile?.provinceId,
      branch: branchCode || userProfile?.branch,
    };
    setIsEdit(false);
    setSelected({ ...record, status: record?.status || t('status.active') });
    setShow(true);
  };

  const expandedRowRender = (record) => {
    return (
      <div className="bg-light bordered pb-1">
        {record.nickName && <ListItem label={t('fields.nickName')} info={record.nickName} />}
        {record.employeeCode && (
          <ListItem label={t('fields.employeeCode')} info={record.employeeCode} />
        )}
      </div>
    );
  };

  return (
    <div className={`main-content-container ${isMobile ? 'px-0' : 'px-4'}`}>
      <Row className="page-header pt-4 align-items-center">
        <PageTitle sm="3" title={t('title')} subtitle={t('subtitle')} className="text-sm-left" />
      </Row>
      {!isBranchManagerOrAbove ? (
        <Row className="justify-center mt-8">
          <Col span={24} className="text-center">
            <h3 className="text-danger mb-4">{t('messages.error.permissionDenied')}</h3>
            <p>{t('messages.error.insufficientPermissions')}</p>
          </Col>
        </Row>
      ) : !canViewEmployees ? (
        <Row className="justify-center mt-8">
          <Col span={24} className="text-center">
            <h3 className="text-danger mb-4">{t('messages.error.permissionDenied')}</h3>
            <p>{t('messages.error.insufficientPermissions')}</p>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-3" style={{ alignItems: 'center' }}>
            <Col xs={18} md={8}>
              <Search
                placeholder={t('search.placeholder')}
                onChange={_onSearch}
                enterButton
                allowClear
              />
            </Col>
            <Col xs={4} md={4} className={`ml-4 ${isMobile ? '' : ''}`}>
              <AddButton onClick={_add} disabled={!canAddEmployee} />
            </Col>
          </Row>
          <EditableRowTable
            title={() => <h6 className="m-0 text-success">{t('table.title')}</h6>}
            dataSource={data}
            columns={getColumns(data, isMobile, t, hasPermission, hasProvinceAccess)}
            expandable={
              isMobile && {
                expandedRowRender,
                rowExpandable: (record) => record.name !== 'Not Expandable',
              }
            }
            onRow={(record) => ({
              onClick: () => handleSelect(record),
            })}
            loading={EMPLOYEES.loading}
            scroll={{ y: '60vh' }}
            pagination={{ pageSize: 10 }}
            rowClassName={(record) =>
              record.status === t('status.resigned') ? 'rejected-row' : undefined
            }
          />
          {show && selected && (
            <Modal
              open={show && selected}
              width={isMobile ? '92%' : '77%'}
              style={{ left: isMobile ? 0 : '8%' }}
              onCancel={() => setShow(false)}
              footer={[]}
              destroyOnClose
            >
              <div className="border-bottom p-3">
                <Row style={{ alignItems: 'center' }}>
                  <button onClick={() => setShow(false)} className="btn btn-white">
                    &larr; {t('actions.back')}
                  </button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px',
                    }}
                  >
                    <h6 className="text-primary ml-3">{selected?.displayName || ''}</h6>
                  </div>
                </Row>
              </div>
              <div className="p-0 pb-3">
                <EmployeeProfile
                  selectedEmployee={selected}
                  onCancel={() => setShow(false)}
                  isEdit={isEdit}
                />
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default Employees;
