import React, { useRef, useContext, useCallback } from 'react';
import { useMergeState } from 'api/CustomHooks';
import { Button, Popconfirm } from 'antd';
import Excels from 'Modules/Utils/Excels';
import { FirebaseContext } from '../../../firebase';
import { showLog, formatExcelToJson, errorHandler } from 'utils/functions';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { UploadOutlined } from '@ant-design/icons';
import { getTitle, onConfirm, _checkImportData } from './api';
import { useModal } from 'contexts/ModalContext';

export default () => {
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.data);
  const { api, firestore } = useContext(FirebaseContext);
  const { showAlert, showWarn, showSuccess } = useModal();
  const [cState, setCState] = useMergeState({
    loading: false,
    loaded: false,
  });

  const history = useHistory();
  const location = useLocation();
  const params = location.state.params;
  // showLog({ params });
  const dataType = params?.dataType;

  const loadedData = useRef(null);
  const loadedJson = useRef(null);

  const _onDataLoaded = async (dataLoaded, byPassDuplicateCheck) => {
    try {
      showLog('dataLoaded', dataLoaded);
      let nData = JSON.parse(JSON.stringify(dataLoaded));
      let nRows = [];
      for (var i = 0; i < dataLoaded.rows.length; i++) {
        if (dataLoaded.rows[i].length > 0) {
          nRows.push(dataLoaded.rows[i]);
        }
      }
      nData.rows = nRows;
      let jsonData = await formatExcelToJson(nData, api, user);
      if (dataType === 'vehicles') {
        jsonData = jsonData.map((it) => ({
          ...it,
          billNoSKC: `${it.storeLocationCode.substr(0, 2)}${it.billNoSKC}`,
        }));
      }
      if (dataType === 'vehicleList') {
        jsonData = jsonData.map((it) => ({
          ...it,
          ...(it.isUsed && { isUsed: true }),
          ...(!!it.productType && it.productType === 'แทรกเตอร์' && { productType: 'รถแทรกเตอร์' }),
        }));
      }
      showLog({ nData, jsonData });
      // Check correctness, duplication, etc.
      const isDataCorrected = await _checkImportData(
        nData,
        jsonData,
        dataType,
        firestore,
        users,
        byPassDuplicateCheck,
      );
      //  showLog({ isDataCorrected });
      if (!isDataCorrected.result) {
        //
        showAlert({
          title: 'ไม่สำเร็จ',
          content: isDataCorrected.info,
          type: 'warning',
          onOk: handleCancel,
        });
        // Allow re-upload duplicate data. (เขียนทับของเดิม)
        // showAlert({
        //   title: `ไม่สำเร็จ ${isDataCorrected.info}`,
        //   content: 'ต้องการอัปโหลดข้อมูลอีกครั้งหรือไม่ ?',
        //   type: 'warning',
        //   onOk: () => _checkImportData(dataLoaded, true),
        //   onCancel: handleCancel
        // });
        return;
      }
      loadedData.current = nData;
      loadedJson.current = jsonData;
      setCState({ loaded: true });
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const handleCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  const _onConfirm = useCallback(async () => {
    try {
      const batchNo = await onConfirm({
        currentData: loadedJson.current,
        api,
        firestore,
        dataType,
        user,
        handleCancel,
      });
      if (batchNo) {
        if (['vehicles', 'parts'].includes(dataType)) {
          // Re-check data using cloud-task (Cloud function sometimes not update keywords.)
          let ts = Date.now().toString();
          await api.setItem({ ts, dataType, batchNo }, 'sections/stocks/importLog', ts);
        }
        showSuccess(`นำเข้าข้อมูล ${getTitle(dataType)} เรียบร้อยแล้ว`, 3, handleCancel);
      }
    } catch (e) {
      showWarn(e.message || e);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          dataType,
          currentData: loadedJson.current,
          module: 'UploadDataFromExcel',
        },
      });
    }
  }, [api, dataType, firestore, handleCancel, user]);

  return (
    <div className="main-content-container p-4 bg-light">
      <Excels
        // style={{ flex: 1, padding: 20 }}
        firstRowIsHeader
        onDataLoaded={_onDataLoaded}
        title={getTitle(dataType)}
      />
      <div className="border-bottom bg-white p-3 text-right">
        <Button className="mr-2 my-2" onClick={handleCancel}>
          &larr; กลับ
        </Button>
        <Popconfirm
          title="อัปโหลดข้อมูลเข้าสู่ระบบ ?"
          onConfirm={_onConfirm}
          onCancel={() => showLog('cancel')}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <Button
            type="primary"
            disabled={!cState.loaded}
            icon={<UploadOutlined />}
            className="mr-2 my-2"
          >
            อัปโหลดข้อมูล
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};
