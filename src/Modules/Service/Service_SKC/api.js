import moment from 'moment';
import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';
import numeral from 'numeral';
import { Numb, roundToNearest5, sortArr } from 'functions';
import Tag from 'antd/es/tag';
import { ListItem } from 'elements';

export const initSearchValue = {
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  branchCode: null
};

const currencyProps = {
  align: 'right',
  render: text => <div className={!text ? 'transparent' : ''}>{text ? numeral(text).format('0,0.00') : '-'}</div>,
  width: 120
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'docDate'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    width: 120
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'orderNo'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customerName'
  },
  {
    title: 'ลักษณะงานที่ทำ',
    dataIndex: 'orderTypeDesc'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'model'
  },
  {
    title: 'ค่าแรง',
    dataIndex: 'wages',
    ...currencyProps
  },
  {
    title: 'ค่าขนส่ง',
    dataIndex: 'freights',
    ...currencyProps
  },
  {
    title: 'อื่นๆ',
    dataIndex: 'others',
    ...currencyProps
  },
  {
    title: 'ค่าอะไหล่',
    children: [
      {
        title: 'ยอดเต็ม',
        dataIndex: 'partBeforeDiscount',
        key: 1,
        ...currencyProps
      },
      {
        title: 'ส่วนลด SKC',
        dataIndex: 'partSKCDiscount',
        key: 2,
        ...currencyProps
      },
      {
        title: 'คงเหลือ',
        dataIndex: 'parts',
        key: 3,
        ...currencyProps
      }
    ]
  },
  {
    title: 'ค่าน้ำมัน',
    children: [
      {
        title: 'ยอดเต็ม',
        dataIndex: 'oilBeforeDiscount',
        key: 1,
        ...currencyProps
      },
      {
        title: 'ส่วนลด SKC',
        dataIndex: 'oilSKCDiscount',
        key: 2,
        ...currencyProps
      },
      {
        title: 'คงเหลือ',
        dataIndex: 'oils',
        key: 3,
        ...currencyProps
      }
    ]
  },
  {
    title: 'ยอดรวม',
    dataIndex: 'netPrice'
  },
  // {
  //   title: 'น้ำมันเครื่อง',
  //   dataIndex: 'oilSum',
  //   width: 220,
  //   render: (tags) => (
  //     <span>
  //       {tags.map((tag) => {
  //         let color = tag.description.includes('CF4') ? 'geekblue' : 'green';
  //         if (tag.description.includes('18 ลิตร')) {
  //           color = 'volcano';
  //         }
  //         return (
  //           <Tag color={color} key={tag.description}>
  //             {`${tag.description.toUpperCase()} x ${tag.qty}`}
  //           </Tag>
  //         );
  //       })}
  //     </span>
  //   ),
  // },
  {
    title: 'ส่วนลด (%)',
    dataIndex: 'percentDiscount',
    align: 'right',
    render: text => (
      <div className={!text ? 'transparent' : ''}>
        {text && Numb(text) > 0 && Numb(text) < 50 ? `${roundToNearest5(text)}%` : '-'}
      </div>
    ),
    width: 80
  }
];

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <ListItem label="รถ" info={record.productName} />
      <ListItem label="เลขรถ" info={record.vehicleNo} />
      {record.oilSum && record.oilSum.length > 0 && (
        <ListItem
          label="น้ำมันเครื่อง, ไฮดรอลิค"
          info={sortArr(record.oilSum, ['description']).map(tag => {
            let color = tag.description.includes('CF4') ? 'geekblue' : 'green';
            if (tag.description.includes('18 ลิตร')) {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag.description}>
                {`${tag.description.toUpperCase()} x ${tag.qty}`}
              </Tag>
            );
          })}
        />
      )}
      <ListItem
        label="ช่างบริการ"
        info={
          record.serviceTechnician && record.serviceTechnician.length > 0
            ? record.serviceTechnician.map((tag, n) => {
                // let color = n % 2 === 0 ? 'geekblue' : 'green';
                return (
                  <Tag color={'blue'} key={tag}>
                    {tag}
                  </Tag>
                );
              })
            : '-'
        }
      />
      <ListItem label="วันที่ปิดงาน" info={moment(record.jobCloseDate, 'YYYY-MM-DD').format('D/MM/YYYY')} />
      <ListItem
        label="สถานะ"
        info={record.serviceStatus}
        isTag
        color={record.serviceStatus === 'ปิดงานสมบูรณ์' ? 'green' : 'orange'}
      />
    </div>
  );
};

export const renderHeader = () => (
  <div className="bg-white pt-3 px-4 border-bottom">
    {/* <Row>
      <Col md="4">
        <Form.Item name="saleNo" label="🔍 ค้นหาจาก เลขที่ใบขายสินค้า">
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy={['saleNo', 'firstName']}
            wheres={[['saleType', '==', saleType]]}
            size="small"
            hasAll
            hasKeywords
          />
        </Form.Item>
      </Col> */}
    <Row>
      <Col md="2">
        <Form.Item name="startDate" label="🔍  วันที่">
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="branchCode" label="🔍  สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getTitleFromPath = path => {
  switch (path) {
    case '/service-data-skc':
      return 'ในศูนย์';
    case '/service-input':
      return 'นอกพื้นที่';

    default:
      return 'รายได้';
  }
};
