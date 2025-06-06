/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { showLog } from 'functions';
import { Table, Input, InputNumber, Popconfirm, Form, Select, Button } from 'antd';
import numeral from 'numeral';
import moment from 'moment';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../../../firebase';

const { Option } = Select;

const EditableCell = ({ editing, dataIndex, title, number, record, index, children, ...restProps }) => {
  const inputNode = number ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`
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

const ExpandableTable = ({ originData, record, onChangeTotal, expenseNames, selectedDate, branchCode, isInput }) => {
  const { api } = useContext(FirebaseContext);
  const { branches, employees } = useSelector(state => state.data);

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = record => record.key === editingKey;

  const dataRef = useRef(originData);

  useEffect(() => {
    //  showLog('nextData', originData);
    setData(originData);
    dataRef.current = originData;
  }, [originData]);

  const edit = record => {
    form.setFieldsValue({
      expenseName: '',
      total: '',
      address: '',
      ...record
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const deleteItem = key => {
    const newData = [...data];
    const index = newData.findIndex(item => key === item.key);
    api.deleteItem('sections/account/expenses', newData[index]._key);
    newData.splice(index, 1);
    dataRef.current = newData;
    setData(newData);
    setEditingKey('');
    let total = newData.reduce((sum, elem) => sum + Numb(elem?.total), 0);
    onChangeTotal({
      expenseCategoryId: expenseNames[0].expenseCategoryId,
      total
    });
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        // showLog('updateItem', { ...item, ...row });
        api.updateItem({ ...item, ...row }, 'sections/account/expenses', item._key);
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
      dataRef.current = newData;
      let total = newData.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      onChangeTotal({
        expenseCategoryId: expenseNames[0].expenseCategoryId,
        total
      });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const onAdd = useCallback(
    values => {
      //  showLog('values', values);
      //  showLog('dataRef', dataRef.current);
      api.addItem(
        {
          // expenseOrderId: ,
          time: Date.now(),
          date: moment(selectedDate).format('YYYY-MM-DD'),
          branchCode,
          expenseCategoryId: expenseNames[0].expenseCategoryId,
          expenseItemId: expenseNames.find(l => l.expenseName === values.addExpenseItem).expenseItemId,
          expenseName: values.addExpenseItem,
          total: values.addTotal,
          key: Date.now()
        },
        'sections/account/expenses'
      );

      const newData = [
        ...dataRef.current,
        {
          // expenseOrderId: ,
          itemId: Date.now(),
          time: Date.now(),
          date: moment(selectedDate).format('YYYY-MM-DD'),
          branchCode,
          expenseItemId: expenseNames.find(l => l.expenseName === values.addExpenseItem).expenseItemId,
          expenseName: values.addExpenseItem,
          total: values.addTotal,
          key: Date.now()
        }
      ];
      dataRef.current = newData;
      setData(newData);
      form2.resetFields();
      let total = newData.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      onChangeTotal({
        expenseCategoryId: expenseNames[0].expenseCategoryId,
        total
      });
    },
    [api, branchCode, expenseNames, form2, onChangeTotal, selectedDate]
  );

  const columns = isInput
    ? [
        {
          title: 'รายการ',
          dataIndex: 'expenseName',
          width: '40%',
          editable: false
        },
        {
          title: 'จำนวนเงิน',
          dataIndex: 'total',
          width: '20%',
          editable: true
        },
        {
          title: '',
          dataIndex: 'operation',
          render: (_, record) => {
            const editable = isEditing(record);
            return editable ? (
              <span>
                <a
                  // eslint-disable-next-line no-script-url
                  href="javascript:;"
                  onClick={() => save(record.key)}
                  style={{
                    marginRight: 8
                  }}
                >
                  บันทึก
                </a>
                <Popconfirm title="ลบรายการ?" okText="ใช่" cancelText="ไม่ใช่" onConfirm={() => deleteItem(record.key)}>
                  <a
                    className="text-danger"
                    style={{
                      marginRight: 8
                    }}
                  >
                    ลบ
                  </a>
                </Popconfirm>
                <Popconfirm title="ยกเลิกการแก้ไข?" okText="ใช่" cancelText="ไม่ใช่" onConfirm={cancel}>
                  <a>ยกเลิก</a>
                </Popconfirm>
              </span>
            ) : (
              <a className="ml-auto" href="#" disabled={editingKey !== ''} onClick={() => edit(record)}>
                แก้ไข
              </a>
            );
          }
        }
      ]
    : [
        {
          title: 'วันที่',
          dataIndex: 'date',
          width: '10%',
          editable: false,
          render: text => <a>{moment(text, 'YYYY-MM-DD').format('DD/MM/YY')}</a>
        },
        {
          title: 'ผู้เบิกจ่าย',
          dataIndex: 'payer',
          width: '15%',
          editable: false,
          render: text => <a>{`${employees[text].prefix} ${employees[text].firstName}`}</a>
        },
        {
          title: 'รายการ',
          dataIndex: 'expenseName',
          width: '40%',
          editable: false
        },
        {
          title: 'สาขา',
          dataIndex: 'branchCode',
          width: '20%',
          editable: false,
          render: text => <a>{branches[text].branchName}</a>
        },
        {
          title: 'จำนวนเงิน',
          dataIndex: 'total',
          width: '15%',
          editable: true,
          render: text => <a>{numeral(text).format('0,0.00')}</a>
        }
      ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'total' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });

  return (
    <>
      {data.length > 0 && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell
              }
            }}
            columns={mergedColumns}
            dataSource={data}
            pagination={false}
            rowClassName="editable-row"
          />
        </Form>
      )}
      {isInput && (
        <Form
          form={form2}
          layout="inline"
          className="mt-2"
          onFinish={onAdd}
          initialValues={{
            addExpenseItem: null,
            addTotal: null,
            expenseItemId: null
          }}
        >
          <Form.Item
            name="addExpenseItem"
            rules={[{ required: true, message: 'กรุณาเลือกรายการ' }]}
            style={{ width: '40%' }}
            className="mr-2"
          >
            <Select placeholder="เลือกรายการที่ต้องการบันทึกข้อมูล" onChange={ev => showLog('select', ev)} allowClear>
              {expenseNames.map(it =>
                it.expenseName ? (
                  <Option key={it.expenseItemId} value={it.expenseName}>
                    {it.expenseName}
                  </Option>
                ) : null
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="addTotal"
            rules={[
              { required: true, message: 'กรุณาป้อนจำนวนเงิน' },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || !isNaN(value)) {
                    return Promise.resolve();
                  }

                  return Promise.reject('กรุณาป้อนจำนวนเงินเป็นตัวเลข');
                }
              })
            ]}
            style={{ width: '20%' }}
            className="mr-3"
          >
            <Input placeholder="จำนวนเงิน" />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="mr-2">
            + ยืนยัน
          </Button>
          <Button htmlType="button" onClick={() => form2.resetFields()}>
            ล้างข้อมูล
          </Button>
        </Form>
      )}
    </>
  );
};

export default ExpandableTable;
