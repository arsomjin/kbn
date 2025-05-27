import React, { useCallback } from 'react';
import { Form, Typography, Input as AInput, Button } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Input } from 'elements';
import { getRulesFromColumn } from 'api/Table';
import { formatNumber, parser } from 'utils/functions';
import numeral from 'numeral';
import { Numb } from 'utils/functions';
const { Text } = Typography;

const getAlign = (algn) => {
  switch (algn) {
    case 'left':
      return { alignLeft: true };
    case 'right':
      return { alignRight: true };
    case 'center':
      return { center: true };

    default:
      break;
  }
};

const ArrayInput = ({ name, columns, addText, disabled, readOnly, form, hasSum, ...props }) => {
  const formatter = useCallback((val) => formatNumber(val), []);
  const inputParser = useCallback((val) => parser(val), []);
  const hasUnitPrice = columns.findIndex((l) => l.name === 'unitPrice') > -1;
  const hasQty = columns.findIndex((l) => l.name === 'qty') > -1;
  const hasToSum = !!hasSum || (hasUnitPrice && hasQty);
  const arr = form ? form.getFieldValue(name) || [] : [];
  // showLog({ arr, name });
  let gTotal = 0;
  if (hasToSum) {
    gTotal = arr.reduce(
      (sum, elem) => sum + Numb(parser(elem?.unitPrice || 0)) * Numb(parser(elem?.qty || 0)),
      0,
    );
  } else {
    gTotal = arr.reduce((sum, elem) => sum + (elem?.total ? Numb(parser(elem.total)) : 0), 0);
  }
  // console.log({ name, arr, gTotal, columns });
  return (
    <Form.List name={name} {...props}>
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.length > 0 && (
              <AInput.Group compact className="d-flex flex-row">
                {columns.map((col, n) => {
                  return (
                    <Text
                      key={`label${col.name}`}
                      style={{
                        flex: col.flex || 1,
                        textDecorationLine: 'underline',
                        textAlign: col.align,
                      }}
                      className="m-1"
                    >
                      {col.placeholder}
                    </Text>
                  );
                })}
                <div style={{ flex: 0.4 }} />
              </AInput.Group>
            )}
            {fields.map((field) => {
              return (
                <AInput.Group key={field.key} compact className="d-flex flex-row">
                  {columns &&
                    columns.map((fld, i) => {
                      const isNumber =
                        (fld.number || fld.decimals || fld.currency) &&
                        !(hasToSum && fld.name === 'total');
                      const isTotal = fld.name === 'total';
                      const autoSum = hasToSum && isTotal;
                      return (
                        <Form.Item
                          {...{ ...field, key: fld.name }}
                          name={[field.name, fld.name]}
                          fieldKey={[field.fieldKey, fld.name]}
                          rules={getRulesFromColumn(fld)}
                          style={{ flex: fld.flex || 1 }}
                          className="mb-0"
                        >
                          <Input
                            placeholder={
                              fld.placeholder || (fld.number ? 'ป้อนจำนวน' : 'ป้อนข้อมูล')
                            }
                            onKeyDown={(e) => {
                              // showLog('ON_KEY_DOWN', e.key);
                              if (['Enter', 'Tab'].includes(e.key)) {
                                const isLastField = i === columns.length - (hasToSum ? 2 : 1);
                                let nextFocus = 1;
                                if (isLastField) {
                                  nextFocus = hasToSum ? 3 : 2;
                                }
                                const eForm = e.target.form;
                                const index = Array.prototype.indexOf.call(eForm, e.target);
                                eForm.elements[index + nextFocus].focus();
                                e.preventDefault();
                              }
                            }}
                            onBlur={() => {
                              if (form && arr[field.name]) {
                                let qty = arr[field.name]['qty'];
                                let unitPrice = arr[field.name]['unitPrice'];
                                let total =
                                  !!qty && !!unitPrice
                                    ? Numb(parser(qty)) * Numb(parser(unitPrice))
                                    : null;
                                if (total) {
                                  arr[field.name]['total'] = total;
                                  form.setFieldsValue({ [name]: arr });
                                }
                              }
                            }}
                            autoFocus={fld.name === columns[0].name}
                            disabled={autoSum || disabled}
                            readOnly={autoSum || readOnly}
                            {...(fld.align && getAlign(fld.align))}
                            {...(isNumber &&
                              !(autoSum || disabled || readOnly) && {
                                formatter,
                                parser: inputParser,
                              })}
                            {...(fld?.number &&
                              !(autoSum || disabled || readOnly) && {
                                number: true,
                              })}
                            {...(fld?.decimals &&
                              !(autoSum || disabled || readOnly) && {
                                decimals: true,
                              })}
                            {...(fld?.currency &&
                              !(autoSum || disabled || readOnly) && {
                                currency: true,
                              })}
                          />
                        </Form.Item>
                      );
                    })}
                  <Button
                    type="text"
                    className="px-2 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={disabled || readOnly}
                    onClick={() => remove(field.name)}
                    icon={<CloseOutlined />}
                  />
                </AInput.Group>
              );
            })}
            {fields.length > 0 && !!form && (
              <div className="d-flex flex-row">
                {columns.map((col, n) => {
                  return (
                    <Text
                      key={`footer${col.name}`}
                      style={{
                        flex: col.flex || 1,
                        textAlign: col.align,
                        textDecorationLine: 'underline',
                      }}
                      className="m-1 text-primary"
                    >
                      {col.name === 'total' ? numeral(gTotal).format('0,0.00') : ''}
                    </Text>
                  );
                })}
                <div style={{ flex: 0.4 }} />
              </div>
            )}
            <Form.Item className={fields.length > 0 ? 'mb-2 mt-1' : 'mb-2 mt-0'}>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                disabled={disabled || readOnly}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {addText || 'เพิ่มรายการ'}
              </Button>
            </Form.Item>
          </>
        );
      }}
    </Form.List>
  );
};

export default ArrayInput;
