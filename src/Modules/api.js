import React from 'react';
import { Form } from 'antd';
import { getInputNode } from 'api/Table';

export const itemWidth = {
  payer: 120,
  expenseCategoryId: 140,
  expenseName: 220,
  expenseBranch: 180,
  item: 220,
  department: 180,
  total: 120,
  balance: 80,
  expenseAccountName: 200,
  expenseAccountNameId: 200,
  dealer: 160,
  billNo: 140,
  isVatIncluded: 100,
  receiver: 220,
  bank: 120,
  accNo: 120,
  remark: 180,
  bankName: 200,
  refNo: 140,
  payInNo: 140,
  taxInvoiceNo: 180,
  docNo: 120,
  whTaxDoc: 120,
  transferDate: 100
};

export const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  let inputNode = getInputNode(dataIndex, inputType);
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
            width: itemWidth[dataIndex] || 80
          }}
          rules={[
            {
              required: dataIndex !== 'remark',
              message: `ป้อนข้อมูล ${title}!`
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};
