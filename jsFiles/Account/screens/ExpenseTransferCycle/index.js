import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import PageTitle from 'components/common/PageTitle';
import { DatePicker } from 'elements';
import { Form } from 'antd';
import TransferCycleItemSelector from 'components/TransferCycleItemSelector';
import EditableCellTable from 'components/EditableCellTable';
import { InitValues, columns, getTransferCycleData } from './api';
import { TableSummary } from 'api/Table';
import { showWarn } from 'functions';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment-timezone';
import Footer from 'components/Footer';
import { CheckOutlined } from '@ant-design/icons';
import { arrayForEach } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { FirebaseContext } from '../../../../firebase';
import { load } from 'functions';
import { showSuccess } from 'functions';
import { waitFor } from 'functions';
import { createNewId } from 'utils';

export default () => {
  const { api } = useContext(FirebaseContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(InitValues);
  const [selecteds, setSelected] = useState([]);

  const [form] = useForm();

  const _onValuesChange = (val) => {
    setFilters({ ...filters, ...val });
  };

  const _getData = useCallback(async (fil) => {
    try {
      setLoading(true);
      const arr = await getTransferCycleData(fil);
      setData(arr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // get data.
    _getData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const _resetToInitial = async () => {
    form.resetFields();
    await waitFor(0);
    setData([]);
    setSelected([]);
  };

  const _onConfirm = async () => {
    let arr = getArrFromSelects(selecteds).map((it) => {
      delete it.id;
      delete it.key;
      delete it._key;
      return it;
    });
    // showLog('CONFIRMED', arr);
    try {
      load(true);
      await arrayForEach(arr, async (it, i) => {
        const mIt = cleanValuesBeforeSave(it, true);
        let _key = createNewId('ACC-EXP');
        await api.setItem(
          { ...mIt, _key },
          'sections/account/expenseTransfer',
          _key
        );
        switch (it.expenseType) {
          case 'headOfficeTransfer':
            await api.updateItem(
              {
                transferCompleted: _key,
              },
              'sections/account/expenseItems',
              it.expenseItemId
            );
            break;
          case 'purchaseTransfer':
            await api.updateItem(
              {
                transferCompleted: _key,
              },
              'sections/account/expenses',
              it._key
            );
            break;
          case 'referring':
            await api.updateItem(
              {
                transferCompleted: _key,
              },
              'sections/credits/credits',
              it._key
            );
            break;

          default:
            break;
        }
      });
      load(false);
      showSuccess(
        () => _resetToInitial(),
        `บันทึกรายการจ่ายเงินโอนตามรอบเงินโอนประจำวันที่ ${moment(
          filters.date
        ).format('D/M/YYYY')} สำเร็จ`,
        true
      );
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const selectRow = (record) => {
    const selectedRowKeys = [...selecteds];
    if (selectedRowKeys.indexOf(record.key) >= 0) {
      selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
    } else {
      selectedRowKeys.push(record.key);
    }
    setSelected(selectedRowKeys);
  };

  const getArrFromSelects = (sl) => {
    return sl.map((k) => data[k]);
  };

  const _onSelect = (selects) => {
    setSelected(selects);
    const arr = getArrFromSelects(selects);
  };

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys: selecteds,
    onChange: (selectedRowKeys, selectedRows) => {
      _onSelect(selectedRowKeys);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.transferCompleted !== false,
      // Column configuration not to be checked
      transferCompleted: record.transferCompleted,
    }),
  };

  const selection = {
    selections: [
      {
        key: 'allInPage',
        text: 'เลือกหน้านี้',
        onSelect: (changableRowKeys) => {
          _onSelect([...selecteds, ...changableRowKeys]);
        },
      },
      {
        key: 'all',
        text: 'เลือกทั้งหมด',
        onSelect: (changableRowKeys) => {
          //  showLog({ changableRowKeys, originData });
          let allKeys = data.map((l) => l.key);
          _onSelect(allKeys);
        },
      },
      {
        key: 'clearInPage',
        text: 'ไม่เลือกหน้านี้',
        onSelect: (changableRowKeys) => {
          let remainKeys = selecteds.filter(
            (l) => !changableRowKeys.includes(l)
          );
          _onSelect(remainKeys);
        },
      },
      {
        key: 'clearAll',
        text: 'ไม่เลือกทั้งหมด',
        onSelect: (changableRowKeys) => {
          _onSelect([]);
        },
      },
    ],
  };

  const hasSelected = selecteds.length > 0;

  const title = () => (
    <h6 className="m-3 text-center text-primary">
      {`รายการจ่ายเงินโอน ประจำวันที่ ${moment(filters.date).format(
        'D/M/YYYY'
      )}`}
    </h6>
  );

  const footer = () => (
    <h6 className="m-0">
      {hasSelected ? `เลือก ${selecteds.length} จาก ${data.length} รายการ` : ''}
    </h6>
  );

  const mRowSelection =
    data.length > 10 ? { ...rowSelection, ...selection } : rowSelection;

  return (
    <Container fluid className="main-content-container p-3">
      <PageTitle
        sm="4"
        title="บันทึกรอบการโอนเงิน"
        subtitle="บัญชี"
        className="text-sm-left"
      />
      <Form
        form={form}
        initialValues={InitValues}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        <Row className="page-header py-3 mx-3 align-items-center">
          <Col md="4">
            <Form.Item label={'รอบโอนเงินวันที่'} name="date">
              <DatePicker placeholder="รอบโอนเงินวันที่" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item label="รายการ" name="category">
              <TransferCycleItemSelector
                style={{ display: 'flex' }}
                hasAll
                defaultValue="all"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {data.length > 0 && (
        <div className="m-2 text-muted">
          <label>
            กรุณาเลือกรายการ เพื่อสรุปรายการจ่ายเงินโอนตามรอบเงินโอนประจำวันที่{' '}
            {moment(filters.date).format('D/M/YYYY')}
          </label>
        </div>
      )}
      <EditableCellTable
        dataSource={data}
        columns={columns}
        size="small"
        summary={(pageData) => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={5}
            sumKeys={['total']}
          />
        )}
        loading={loading}
        rowSelection={{
          type: 'checkbox',
          ...mRowSelection,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => selectRow(record),
          };
        }}
        footer={footer}
      />
      {selecteds.length > 0 && (
        <div>
          <EditableCellTable
            dataSource={getArrFromSelects(selecteds).map((it, id) => ({
              ...it,
              id,
              key: id,
            }))}
            columns={columns}
            size="small"
            summary={(pageData) => (
              <TableSummary
                pageData={pageData}
                dataLength={columns.length}
                startAt={5}
                sumKeys={['total']}
              />
            )}
            title={title}
          />
          <Footer
            onConfirm={() => _onConfirm()}
            okPopConfirmText="ยืนยัน?"
            okIcon={<CheckOutlined />}
            alignRight
            okOnly
          />
        </div>
      )}
    </Container>
  );
};
