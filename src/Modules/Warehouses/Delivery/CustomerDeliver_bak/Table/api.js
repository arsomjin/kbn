import React from 'react';
import { ListItem } from 'elements';
import { toPhone } from 'functions';

const childProps = {
  align: 'center',
  // render: (text) => (
  //   <div className={!text ? 'transparent' : ''}>
  //     {text ? numeral(text).format('0,0.00') : '-'}
  //   </div>
  // ),
  width: 80
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่ส่งรถ',
    dataIndex: 'deliverDate'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'productCode'
  },
  //   {
  //     title: 'เลขรถ',
  //     dataIndex: 'vehicleNo',
  //   },
  //   {
  //     title: 'หมายเลขเครื่องยนต์',
  //     dataIndex: 'engineNo',
  //   },
  //   {
  //     title: 'รุ่นอุปกรณ์ต่อพ่วง',
  //     dataIndex: 'peripheralId',
  //   },
  //   {
  //     title: 'หมายเลขอุปกรณ์ต่อพ่วง',
  //     dataIndex: 'peripheralNo',
  //   },
  //   {
  //     title: 'เลขใบดัน',
  //     dataIndex: 'pressureBladeNo',
  //   },
  //   {
  //     title: 'หมายเลขบุ้งกี๋',
  //     dataIndex: 'bucketNo',
  //   },
  //   {
  //     title: 'หมายเลขคีบอ้อย',
  //     dataIndex: 'sugarcanePickerNo',
  //   },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName'
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName'
  },
  {
    title: 'เบอร์โทร',
    dataIndex: 'phoneNumber',
    width: 140
  },
  //   {
  //     title: 'ข้อมูลลูกค้า',
  //     children: [
  //       {
  //         title: 'ชื่อ',
  //         dataIndex: 'firstName',
  //         key: 1,
  //         ...childProps,
  //       },
  //       {
  //         title: 'นามสกุล',
  //         dataIndex: 'lastname',
  //         key: 2,
  //         ...childProps,
  //       },
  //       {
  //         title: 'บ้านเลขที่',
  //         dataIndex: 'address',
  //         key: 3,
  //         ...childProps,
  //       },
  //       {
  //         title: 'หมู่ที่',
  //         dataIndex: 'moo',
  //         key: 4,
  //         ...childProps,
  //       },
  //       {
  //         title: 'หมู่บ้าน',
  //         dataIndex: 'village',
  //         key: 5,
  //         ...childProps,
  //       },
  //       {
  //         title: 'ตำบล',
  //         dataIndex: 'tambol',
  //         key: 6,
  //         ...childProps,
  //       },
  //       {
  //         title: 'อำเภอ',
  //         dataIndex: 'amphoe',
  //         key: 7,
  //         ...childProps,
  //       },
  //       {
  //         title: 'จังหวัด',
  //         dataIndex: 'province',
  //         key: 8,
  //         width: 120,
  //       },
  //       //   {
  //       //     title: 'รหัสไปรษณีย์',
  //       //     dataIndex: 'postcode',
  //       //     key: 9,
  //       //     ...childProps,
  //       //   },
  //       {
  //         title: 'โทรศัพท์',
  //         dataIndex: 'phoneNumber',
  //         key: 10,
  //         width: 120,
  //       },
  //     ],
  //   },
  {
    title: 'เวลาจัดส่ง',
    dataIndex: 'deliverTime'
  },
  {
    title: 'เวลาถึง',
    dataIndex: 'arrivalTime'
  },
  {
    title: 'เวลานัดหมาย',
    dataIndex: 'appointmentTime'
  },
  {
    title: 'ผู้ส่ง',
    dataIndex: 'sender',
    align: 'center'
  },
  {
    title: 'ผู้แจ้ง',
    dataIndex: 'recordedBy',
    align: 'center'
  }
];

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <div className="border py-2">
        <label className="text-primary ml-4">ข้อมูลรถ</label>
        <div className="d-flex flex-row">
          <div>
            <ListItem label="รุ่นรถ" info={record.productCode} />
            <ListItem label="เลขรถ" info={record.vehicleNo} />
            <ListItem label="เลขเครื่องยนต์" info={record.engineNo} />
          </div>
          <div>
            <ListItem label="เลขอุปกรณ์" info={record.peripheralNo} />
            <ListItem label="เลขใบดัน" info={record.pressureBladeNo} />
            <ListItem label="เลขบุ้งกี๋" info={record.bucketNo} />
            <ListItem label="เลขคีบอ้อย" info={record.sugarcanePickerNo} />
          </div>
        </div>
      </div>
      <div className="border py-2 mt-2">
        <label className="text-primary ml-4">ข้อมูลลูกค้า</label>
        <div className="d-flex flex-row">
          <div>
            <ListItem label="ชื่อ-นามสกุล" info={`${record.firstName} ${record.lastName}`} />
            <ListItem label="บ้านเลขที่" info={record.address} />
            <ListItem label="หมู่บ้าน" info={record.village} />
            <ListItem label="อำเภอ" info={record.amphoe} />
          </div>
          <div>
            <ListItem label="เบอร์โทร" info={toPhone(record.phoneNumber)} />
            <ListItem label="หมู่ที่" info={record.moo} />
            <ListItem label="ตำบล" info={record.tambol} />
            <ListItem label="จังหวัด" info={record.province} />
          </div>
        </div>
      </div>
    </div>
  );
};
