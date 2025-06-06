import { FilterSnap } from 'data/Constant';
import { checkCollection } from 'firebase/api';
import React from 'react';
import { Check, Close } from '@material-ui/icons';
import { Col, Row } from 'shards-react';
import { ListItem } from 'elements';
import { UploadImage } from 'elements';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...FilterSnap.branch
  },
  {
    title: 'รหัสสินค้า',
    dataIndex: 'productCode',
    width: 140
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    width: 180,
    align: 'center'
  },
  {
    title: 'สถานะ',
    children: [
      {
        title: 'ลอก',
        dataIndex: 'isDecal',
        width: 50,
        align: 'center',
        render: (_, record) => (
          <div className={record?.isDecal ? 'text-success' : 'text-warning'}>
            {record?.isDecal ? <Check /> : <Close />}
          </div>
        )
      },
      {
        title: 'เบิก',
        dataIndex: 'isTaken',
        width: 50,
        align: 'center',
        render: (_, record) => (
          <div className={record?.isTaken ? 'text-success' : 'text-warning'}>
            {record?.isTaken ? <Check /> : <Close />}
          </div>
        )
      }
    ]
  },

  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    width: 180
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo',
    width: 140,
    align: 'center'
  },
  {
    title: 'การลอกลายรถ',
    children: [
      {
        title: 'ลอกลายแล้ว',
        dataIndex: 'isDecal',
        width: 100,
        align: 'center',
        render: txt => <div className={txt ? 'text-success' : 'text-warning'}>{txt ? <Check /> : <Close />}</div>
      },
      {
        title: 'วันที่ลอกลาย',
        dataIndex: 'decalRecordedDate',
        width: 120,
        align: 'center'
      },
      {
        title: 'ผู้บันทึก',
        dataIndex: 'decalRecordedBy',
        width: 120,
        align: 'center'
      }
    ]
  },
  {
    title: 'การเบิกลอกลาย',
    children: [
      {
        title: 'เบิกแล้ว',
        dataIndex: 'isTaken',
        width: 100,
        align: 'center',
        render: txt => <div className={txt ? 'text-success' : 'text-warning'}>{txt ? <Check /> : <Close />}</div>
      },
      {
        title: 'วันที่เบิก',
        dataIndex: 'decalWithdrawDate',
        width: 120,
        align: 'center'
      },
      {
        title: 'ผู้เบิก',
        dataIndex: 'picker',
        width: 120,
        align: 'center'
      }
    ]
  }
];

export const getDecalData = pCode =>
  new Promise(async (r, j) => {
    // const snap = await checkCollection('sections/stocks/vehicles', [
    //   ['transfer', '!=', null],
    // ]);
    const snap = await checkCollection('sections/stocks/vehicles', [['productPCode', '==', pCode]]);
    let arr = [];
    if (snap) {
      snap.forEach(doc => arr.push({ ...doc.data(), _id: doc.id }));
    }
    // Get docNo, importDate, transferInDate, transferOutDate
    let fArr = arr.map((it, key) => {
      let mIt = { ...it };
      let importData = (it.transactions || []).filter(l => l.type === 'import');
      if (importData.length > 0) {
        mIt.importDate = !!importData[0].docDate ? importData[0].docDate : undefined;
        mIt.skcDoc = importData[0].billNoSKC || it.docNo;
      }

      if (!!it?.decal) {
        mIt.isDecal = true;
        mIt.decalRecordedBy = it.decal?.recordedBy || null;
        mIt.decalRecordedDate = it.decal?.decalRecordedDate || undefined;
        mIt.decalDocNo = it.decal?.docNo || null;
        mIt.urlChassis = it.decal?.urlChassis || null;
        mIt.urlEngine = it.decal?.urlEngine || null;
      }
      if (!!it?.decalTaken) {
        mIt.isTaken = true;
        mIt.picker = it.decalTaken?.picker || null;
        mIt.decalWithdrawDate = it.decalTaken?.decalWithdrawDate || undefined;
      }
      return { ...mIt, key, id: key };
    });

    r(fArr);
  });

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <div className="border py-2">
        {/* <label className="text-primary ml-4">ข้อมูลเพิ่มเติม</label> */}
        <Row>
          <Col md="4">
            <ListItem label="เลขที่เอกสาร SKC" info={record.skcDoc} />
            <ListItem label="วันที่รับ SKC" info={record.importDate} />
            <ListItem label="เลขที่เอกสารลอกลาย" info={record.decalDocNo} />
            <ListItem label="ชื่อสินค้า" info={record.productName || '-'} />
            <ListItem label="เลขอุปกรณ์" info={record.peripheralNo || '-'} />
          </Col>
          <Col md="8">
            <Row>
              <Col md="4">
                <UploadImage
                  storeRef={`images/stocks/decals/chassis`}
                  className="bg-light"
                  resizeMode="contain"
                  width={210}
                  height={110}
                  readOnly
                  value={record.urlChassis}
                  title="ลอกลายเลขตัวถัง"
                />
              </Col>
              <Col md="4">
                <UploadImage
                  storeRef={`images/stocks/decals/engine`}
                  className="bg-light"
                  resizeMode="contain"
                  width={210}
                  height={110}
                  readOnly
                  value={record.urlEngine}
                  title="ลอกลายเลขเครื่อง"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};
