import React from 'react';
import { Form } from 'antd';
import { getRules } from 'api/Table';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { Input, InputGroup } from 'elements';
import numeral from 'numeral';
import {
  Row,
  Col,
  InputGroup as SInputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
} from 'shards-react';
import HiddenItem from 'components/HiddenItem';
import DealerSelector from 'components/DealerSelector';
import WithHoldingTaxSelector from 'components/WithHoldingTaxSelector';
import WithHoldingTaxDocSelector from 'components/WithHoldingTaxDocSelector';
import { Numb } from 'functions';
import { showLog } from 'functions';
import { checkDoc } from 'firebase/api';
import { checkCollection } from 'firebase/api';
import { checkExistingExpense } from '../../api';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import ExpenseNameSelector from 'components/ExpenseNameSelector';
export const renderInput = (values, grant, readOnly) => {
  return (
    <div className="bg-white">
      <HiddenItem name="ledgerRecords" />
      <HiddenItem name="beforeVAT" />
      <HiddenItem name="VAT" />
      <HiddenItem name="whTax" />
      <HiddenItem name="netTotal" />
      <Row>
        <Col md="6">
          <Form.Item name="docNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="dealer" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ผู้จำหน่าย/ผู้รับเงิน"
              inputComponent={(props) => <DealerSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="expenseCategoryId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="หมวดรายจ่าย"
              inputComponent={(props) => (
                <ExpenseCategorySelector
                  placement="bottomRight"
                  disabled={!grant || readOnly}
                  {...props}
                />
              )}
              primary
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="expenseAccountNameId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ชื่อบัญชี"
              inputComponent={(props) => (
                <ExpenseNameSelector
                  record={values}
                  disabled={!grant || readOnly}
                  {...props}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="expenseName" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รายการ" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore="จำนวนเงิน"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="priceType" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทราคา"
              inputComponent={(props) => (
                <PriceTypeSelector style={{ width: '100%' }} {...props} />
              )}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="hasWHTax">
            <InputGroup
              spans={[10, 14]}
              addonBefore="หักภาษี ณ ที่จ่าย"
              inputComponent={(props) => <WithHoldingTaxSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="whTaxDoc">
            <InputGroup
              spans={[10, 14]}
              addonBefore="แบบแสดงภาษีหัก ณ ที่จ่าย"
              inputComponent={(props) => (
                <WithHoldingTaxDocSelector {...props} />
              )}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="refNo">
            <InputGroup
              spans={[10, 14]}
              addonBefore="เลขที่เอกสารอ้างอิง"
              alignRight
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="12" className="d-flex flex-row ">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: '100%' }}>
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export const renderSummary = (data) => {
  const total = data.reduce((sum, elem) => sum + Numb(elem.netTotal), 0);
  // showLog({ total, changeDeposit, data });
  return data.length > 0 ? (
    <div className="d-flex flex-column align-items-end">
      <div style={{ width: 420 }}>
        <SInputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 240 }} className="text-primary">
              รายจ่าย ทั้งสิ้น
            </InputGroupText>
          </InputGroupAddon>
          <FormInput
            disabled
            className="text-right text-primary"
            value={numeral(total).format('0,0.00')}
          />
          <InputGroupAddon type="append">
            <InputGroupText className="text-primary">บาท</InputGroupText>
          </InputGroupAddon>
        </SInputGroup>
      </div>
    </div>
  ) : null;
};

export const columns = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '',
    dataIndex: 'ledgerCompleted',
    editable: false,
    ellipsis: true,
  },
  {
    title: '',
    dataIndex: 'taxInvoiceCompleted',
    editable: false,
    ellipsis: true,
  },
  {
    title: 'เลขที่',
    dataIndex: 'docNo',
    editable: true,
    ellipsis: true,
  },
  {
    title: 'ผู้จำหน่าย/ผู้รับเงิน',
    dataIndex: 'dealer',
    editable: true,
    required: true,
    ellipsis: true,
  },
  {
    title: 'หมวดรายจ่าย',
    dataIndex: 'expenseCategoryId',
    ellipsis: true,
    required: true,
  },
  {
    title: 'ชื่อบัญชี',
    dataIndex: 'expenseAccountNameId',
    ellipsis: true,
    required: true,
  },
  {
    title: 'รายการ',
    dataIndex: 'expenseName',
    editable: true,
    required: true,
    ellipsis: true,
  },
  {
    title: 'ประเภทราคา',
    dataIndex: 'priceType',
    required: true,
    align: 'center',
  },
  {
    title: 'ภาษี ณ ที่จ่าย',
    dataIndex: 'hasWHTax',
    required: true,
    align: 'center',
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    editable: true,
    number: true,
    required: true,
  },
  {
    title: 'ภาษีมูลค่าเพิ่ม',
    key: 'VAT',
    dataIndex: 'VAT',
    required: true,
    width: 140,
  },
  {
    title: 'รวมจำนวนเงิน',
    key: 'totalIncludeVat',
    dataIndex: 'totalIncludeVat',
    required: true,
    width: 140,
    render: (text, record) => (
      <div>
        {numeral(Number(record.beforeVAT) + Numb(record.VAT)).format('0,0.00')}
      </div>
    ),
    align: 'right',
  },
  {
    title: 'หักภาษี ณ ที่จ่าย',
    key: 'whTax',
    dataIndex: 'whTax',
    required: true,
  },
  {
    title: 'จำนวนเงินที่จ่าย',
    key: 'netTotal',
    dataIndex: 'netTotal',
    required: true,
  },
  {
    title: 'เลขที่เอกสารอ้างอิง',
    key: 'refNo',
    dataIndex: 'refNo',
    editable: true,
    ellipsis: true,
    align: 'center',
  },
];

export const initValues = {
  expenseId: null,
  branchCode: null,
  date: undefined,
  expenseType: 'headOfficeTransfer',
  total: null,
};

export const getInitValues = (order) => {
  if (order?.created) {
    return order;
  }
  return {
    ...initValues,
    expenseId: order?.expenseId,
  };
};

export const initItemValues = {
  docNo: null,
  dealer: null,
  priceType: 'includeVat',
  VAT: null,
  hasWHTax: 0,
  whTax: null,
  whTaxDoc: null,
  netTotal: null,
  expenseCategoryId: null,
  expenseName: null,
  total: null,
  expenseAccountNameId: null,
  refNo: null,
  beforeVAT: null,
  ledgerCompleted: false,
  taxInvoiceCompleted: false,
  transferCompleted: false,
  ledgerRecords: [],
  taxInvoiceInfo: null,
  remark: null,
};

export const getInitItem = (item) => {
  if (item) {
    return item;
  }
  return initItemValues;
};

export const ledgerColumns = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'สาขา',
    key: 'expenseBranch',
    dataIndex: 'expenseBranch',
    editable: true,
  },
  {
    title: 'แผนก',
    key: 'department',
    dataIndex: 'department',
    editable: true,
  },
  {
    title: 'รายการ',
    key: 'expenseAccountName',
    dataIndex: 'expenseAccountName',
    editable: true,
  },
  {
    title: 'จำนวนเงิน',
    key: 'total',
    dataIndex: 'total',
    editable: true,
  },
];

export const ledgerInitItemValues = {
  department: null,
  expenseAccountName: null,
  // total: null,
  // priceType: 'includeVat',
  // hasWHTax: 0,
  // whTax: null,
  // whTaxDoc: null,
  // beforeVAT: null,
  // VAT: null,
  netTotal: null,
};

export const handleUpdate = async (filters, nProps) =>
  new Promise(async (r, j) => {
    const { branchCode, date } = filters;
    try {
      let expenses = [];
      let expense = {};
      if (!date || !branchCode) {
        r(false);
        return showLog('NO_DATE_AND_BRANCH_SELECTED');
      }
      // Get expense object.
      if (nProps.isEdit) {
        const doc = await checkDoc(
          'sections',
          `account/expenses/${filters.expenseId}`
        );
        if (doc) {
          expense = doc.data();
        }
      } else {
        let wheres = [
          ['expenseType', '==', 'executive'],
          ['branchCode', '==', branchCode],
          ['date', '==', date],
        ];
        expense = await checkExistingExpense(wheres);
      }

      if (!expense?.expenseId) {
        // No existing expense data.
        r(false);
        return showLog('NO_EXISTING_EXPENSE_DATA');
      }
      let expenseId = expense.expenseId;
      let expenseItems = [];

      let editedBy = expense.editedBy || null;

      if (expense?.items) {
        expenseItems = expense.items.map((it, i) => {
          return {
            ...it,
            id: i,
            key: i,
          };
        });
      } else {
        let wheres2 = [
          ['expenseId', '==', expenseId],
          ['branchCode', '==', nProps.isEdit ? branchCode : expense.branchCode],
          ['date', '==', nProps.isEdit ? date : expense.date],
        ];
        const itemSnap = await checkCollection(
          'sections/account/expenseItems',
          wheres2
        );
        if (itemSnap) {
          itemSnap.forEach((doc) => {
            expenseItems.push({
              ...doc.data(),
              _key: doc.id,
              id: expenseItems.length,
              key: expenseItems.length,
            });
          });
          // showLog({ expenseItems });
        }
      }

      const total = expenseItems.reduce(
        (sum, elem) => sum + Numb(elem?.total),
        0
      );
      r({
        expenseId,
        expenseItems,
        total,
        editedBy,
      });
    } catch (e) {
      j(e);
    }
  });
