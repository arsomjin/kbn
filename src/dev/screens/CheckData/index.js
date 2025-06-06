import React, { useCallback, useContext, useState } from 'react';
import { Container, Row } from 'shards-react';
import PageTitle from 'components/common/PageTitle';
import { Button } from 'elements';
import { List } from 'antd';
import { FirebaseContext } from '../../../firebase';
import { showLog, showWarn, arrayForEach, load, Numb, progress, showAlert } from 'functions';
import { checkCollection } from 'firebase/api';
import numeral from 'numeral';
import { cleanValuesBeforeSave } from 'functions';
import { useSelector } from 'react-redux';
import EditableCellTable from 'components/EditableCellTable';

const lists = [
  {
    title: 'Check data',
    description: ''
  },
  {
    title: 'Update data',
    description: ''
  },
  {
    title: 'Delete import data by batchNo',
    description: ''
  }
];

export const initColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  }
];

export default () => {
  const { firestore, api } = useContext(FirebaseContext);
  const { users, employees } = useSelector(state => state.data);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState(initColumns);
  const [loading, setLoading] = useState(false);

  const _onSelect = item => {
    switch (item.id) {
      case 0:
        _checkData();
        break;
      case 1:
        // let path = 'sections/stocks/importVehicleItems';
        // let batchNo = 1631781609200;
        // editImportDataByBatchNo(path, batchNo);
        break;
      case 2:
        // let collection = `sections/stocks/importParts`;
        // let itemCollection = `sections/stocks/importPartItems`;
        // let batchNo = 1648435289090;
        // deleteImportDataByBatchNo({ collection, itemCollection, batchNo, api });
        break;
      default:
        break;
    }
  };

  const _checkData = useCallback(async () => {
    try {
      load(true);
      setLoading(true);
      const dataSnap = await checkCollection('sections/sales/bookings', [
                        // ['keywords', 'array-contains', '34817391'],
                        ['date', '>=', '2025-03-25']
                        // ['provinceId', '==', 'nakhon-ratchasima'],
                        // ['warehouseChecked', '!=', null],
                        // ['accountChecked', '==', null],
                        // ['rejected', '==', null]
      ]);
      let dataArr = [];
      if (dataSnap) {
        dataSnap.forEach(doc => {
          let item = doc.data();
          dataArr.push({
            ...item,
            _id: doc.id
            // createdDate: moment(item.created).format('D/MM/YYYY HH:mm'),
          });
        });
      }

      // let changes = getChanges(dataArr[1], dataArr[0])

      // const duplicate_data = getAllDuplicates(dataArr, ['date', 'branchCode']);

      // let header = distinctArr(dataArr, ['header']).map((l) => l.header);
      setLoading(false);
      load(false);

      return showLog({ dataArr });

      let plBreak1 = false;

      await arrayForEach(dataArr, async (it, i) => {
        if (plBreak1) {
          return;
        }
        const percent = Numb(((i + 1) * 100) / dataArr.length);
        progress({
          show: true,
          percent,
          text: `กำลังอับเดต ${i + 1} จาก ${numeral(dataArr.length).format('0,0')} รายการ`,
          subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
          onCancel: () => {
            plBreak1 = true;
            showAlert('Aborted');
          }
        });

        // let mIt = { ...it, order: 1, sameAcc: [] };
        let mIt = { ...it };
        // let values = createBookingKeywords(mIt);
        // mIt = cleanValuesBeforeSave(values);

        // const updateBakRef = firestore
        //   .collection('sections/stocks/transfer_bak')
        //   .doc(it._id);
        const updateRef = firestore.collection('sections/sales/vehicles').doc(it._id);

        delete mIt._id;

        // let vNo = it.vehicleNoFull;
        // let vNoShort = "";
        // let pNo = it.peripheralNoFull;
        // let pNoShort = "";
        // if (!!vNo && ["number", "string"].includes(typeof vNo)) {
        //   vNoShort = extractVehicleNo(vNo);
        // }
        // if (!!pNo && ["number", "string"].includes(typeof pNo)) {
        //   pNoShort = extractPeripheralNo(pNo);
        // }
        // let cleanpNo = removeAllNonAlphaNumericCharacters(it.peripheralNoFull)
        // let cleanVNo = removeAllNonAlphaNumericCharacters(it.vehicleNoFull)

        // await updateBakRef.set(mIt, { merge: true }); // Backup data before update.
        await updateRef.update({
          deleted: false
        });
        // await updateRef.delete();
      });

      progress({ show: false, percent: 0, text: null, subtext: null });
    } catch (e) {
      load(false);
      progress({ show: false, percent: 0, text: null, subtext: null });
      showWarn(e);
    }
  }, [firestore]);

  const _updateData = useCallback(async () => {
    try {
      load(true);
      // const dataSnap = await checkCollection('data/products/vehicleList');
      const dataSnap = await checkCollection('sections/stocks/importParts', [['billNoSKC', '==', '8033294038']]);
      let dataArr = [];
      if (dataSnap) {
        dataSnap.forEach(doc => {
          let item = doc.data();
          dataArr.push({
            ...item,
            _id: doc.id
          });
        });
      }

      load(false);

      let plBreak1 = false;

      await arrayForEach(dataArr, async (it, i) => {
        if (plBreak1) {
          return;
        }
        const percent = Numb(((i + 1) * 100) / dataArr.length);
        progress({
          show: true,
          percent,
          text: `กำลังอับเดต ${i + 1} จาก ${numeral(dataArr.length).format('0,0')} รายการ`,
          subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
          onCancel: () => {
            plBreak1 = true;
            showAlert('Aborted');
          }
        });

        const updateRef = firestore.collection('reports/sales/parts_bak').doc(it._id);
        let mIt = { ...it };
        mIt = cleanValuesBeforeSave(mIt);
        delete mIt._id;

        await updateRef.set(mIt);
      });

      progress({ show: false, percent: 0, text: null, subtext: null });
    } catch (e) {
      load(false);
      progress({ show: false, percent: 0, text: null, subtext: null });
      showWarn(e);
    }
  }, [firestore]);

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header py-4 px-4">
        <PageTitle sm="4" title="Check Data" subtitle="Direct update cloud data" className="text-sm-left" />
      </Row>
      <div className="ml-4 bg-light bordered pb-1">
        <List
          itemLayout="horizontal"
          dataSource={lists}
          renderItem={(item, id) => (
            <List.Item
              className="px-2"
              actions={[
                <Button htmlType="button" type="primary" onClick={() => _onSelect({ ...item, id })}>
                  OK
                </Button>
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </div>
      {data.length > 0 && (
        <EditableCellTable
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 100, hideOnSinglePage: true }}
          // summary={(pageData) => (
          //   <TableSummary
          //     pageData={pageData}
          //     dataLength={columns.length}
          //     startAt={3}
          //     sumKeys={['qty']}
          //   />
          // )}
        />
      )}
    </Container>
  );
};
