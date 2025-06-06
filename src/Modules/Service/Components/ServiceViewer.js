import React, { useEffect, useState } from 'react';
import { Form, Input as AInput, Select } from 'antd';
import { getInitialValues } from '../ServiceOrder/api';
import { isMobile } from 'react-device-detect';
import HiddenItem from 'components/HiddenItem';
import { Row, Col } from 'shards-react';
import { Input } from 'elements';
import BranchDateHeader from 'components/branch-date-header';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import Customer from 'components/Customer';
import { Address } from 'components/NameAddress';
import { Name } from 'components/NameAddress';
import { InputGroup } from 'elements';
import { DatePicker, Checkbox } from 'elements';
import CommonSelector from 'components/CommonSelector';
import { VehicleType } from 'data/Constant';
import DealerSelector from 'components/DealerSelector';
import { ServiceCategories } from 'data/Constant';
import ServiceItems from '../ServiceOrder/ServiceItems';
import { useSelector } from 'react-redux';
import VehicleSelector from 'components/VehicleSelector';

export default ({ service, readOnly, disabled, editables = {} }) => {
  const [form] = Form.useForm();
  const [order, setOrder] = useState(service);
  const { theme } = useSelector(state => state.global);

  useEffect(() => {
    setOrder(service);
    form.setFieldsValue(getInitialValues(service));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  return (
    <Form form={form} initialValues={getInitialValues(order)} size="small" layout="vertical">
      {values => {
        //  showLog({ values });
        return (
          <div className={`${isMobile ? '' : 'px-3 '}bg-light pt-3`}>
            {(readOnly || disabled) && <label className="text-warning text-right">อ่านอย่างเดียว*</label>}
            <HiddenItem name="serviceId" />
            <HiddenItem name="customerId" />
            <Row form>
              <Col md="4">
                <Form.Item
                  name="serviceNo"
                  label="ใบแจ้งบริการเลขที่"
                  rules={[
                    {
                      required: true,
                      message: 'กรุณาป้อนเลขที่'
                    }
                  ]}
                >
                  <Input placeholder="ใบแจ้งบริการเลขที่" readOnly={readOnly} disabled={disabled} />
                </Form.Item>
              </Col>
              <Col md="8">
                <BranchDateHeader
                  disabled={disabled || readOnly}
                  disableAllBranches
                  branchRequired
                  dateRequired
                  dateLabel="วันที่บันทึก"
                />
              </Col>
            </Row>
            <Row form>
              <Col md="4">
                <Form.Item
                  name="orderStatus"
                  label="สถานะงานบริการ"
                  rules={[
                    {
                      required: true,
                      message: 'กรุณาป้อนสถานะงานบริการ'
                    }
                  ]}
                >
                  <Input placeholder="สถานะงานบริการ" readOnly={readOnly} disabled={disabled} />
                </Form.Item>
              </Col>
              {!['repairDeposit'].includes(values.serviceType) && (
                <Col md={4}>
                  <Form.Item name="technicianId" label="ช่างบริการ" rules={getRules(['required'])}>
                    <EmployeeSelector disabled={disabled || readOnly} placeholder="ช่างบริการ" mode="tags" />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <div className="px-3 pt-3 border mb-3">
              <label className="mb-3 text-primary">ข้อมูลเจ้าของผลิตภัณฑ์</label>
              <Customer grant={!disabled} readOnly={readOnly} values={values} form={form} size="small" noMoreInfo />
              <Address
                address={values.address}
                disabled={typeof editables?.address !== 'undefined' ? !editables.address : disabled}
                readOnly={typeof editables?.address !== 'undefined' ? !editables.address : readOnly}
              />
              <Row>
                <Col md="2">
                  <label className="text-muted">ที่อยู่ให้บริการ</label>
                </Col>
                <Col md="8">
                  <Form.Item name="sameAddress">
                    <Checkbox disabled={disabled || readOnly}>ที่อยู่เดียวกับเจ้าของผลิตภัณฑ์</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Address
                label="ที่อยู่ให้บริการ"
                address={values.serviceAddress}
                parent={['serviceAddress']}
                // notRequired
                readOnly={readOnly}
              />
            </div>
            <div className="px-3 pt-3 border mb-3">
              <label className="mb-3 text-primary">ผู้ติดต่อ และเวลานัดบริการ</label>
              <Row>
                <Col md="2 ">
                  <label className="text-muted">ผู้ติดต่อ</label>
                </Col>
                <Col md="8">
                  <Form.Item name="sameName">
                    <Checkbox disabled={disabled || readOnly}>ชื่อเดียวกับเจ้าของผลิตภัณฑ์</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Name values={values} nameValue={['contact']} readOnly={readOnly} />
              <Row>
                <Col md="3">
                  <Form.Item name="appointmentDate" rules={getRules(['required'])}>
                    <InputGroup
                      spans={[10, 14]}
                      addonBefore="วันที่นัดหมาย"
                      placeholder="วันที่นัดหมาย"
                      inputComponent={props => <DatePicker disabled={readOnly || disabled} {...props} />}
                    />
                    {/* <DatePicker /> */}
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="appointmentTime" rules={getRules(['required'])}>
                    <InputGroup
                      spans={[10, 14]}
                      addonBefore="เวลานัดหมาย"
                      placeholder="เวลานัดหมาย"
                      inputComponent={props => <DatePicker picker="time" {...props} disabled={readOnly || disabled} />}
                    />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="notifyDate" rules={getRules(['required'])}>
                    <InputGroup
                      spans={[10, 14]}
                      addonBefore="วันที่รับแจ้ง"
                      placeholder="วันที่รับแจ้ง"
                      inputComponent={props => <DatePicker disabled={readOnly || disabled} {...props} />}
                    />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="urgency">
                    <InputGroup
                      spans={[10, 14]}
                      addonBefore="ความเร่งด่วน"
                      placeholder="ระดับ"
                      disabled={disabled}
                      readOnly={readOnly}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col md="4">
                  <Form.Item name="notifiedBy" rules={getRules(['required'])}>
                    <InputGroup
                      spans={[8, 16]}
                      addonBefore="ผู้รับแจ้ง"
                      inputComponent={props => <EmployeeSelector disabled={readOnly || disabled} {...props} />}
                    />
                    {/* <DatePicker /> */}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="px-3 pt-3 border mb-3">
              <label className="mb-3 text-primary">รายละเอียดผลิตภัณฑ์</label>
              <Row form>
                <Col md="3">
                  <Form.Item name="vehicleType" label="ผลิตภัณฑ์" rules={getRules(['required'])}>
                    <CommonSelector
                      placeholder="ผลิตภัณฑ์"
                      optionData={VehicleType}
                      dropdownStyle={{ minWidth: 220 }}
                      disabled={readOnly || disabled}
                    />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="productPCode" label="รุ่น" rules={getRules(['required'])}>
                    {/* <ModelSelector
                      style={{ display: 'flex' }}
                      isUsed={false}
                      isVehicle
                      disabled={readOnly || disabled}
                    /> */}
                    <VehicleSelector placeholder="รุ่น/ รหัส / ชื่อสินค้า" record={{ ...values, isUsed: false }} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="dealer" label="ซื้อจากร้าน">
                    <DealerSelector disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="boughDate" label="วันที่ซื้อ">
                    <DatePicker disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
              </Row>
              <Row form>
                <Col md="3">
                  <Form.Item name="guaranteedEndDate" label="รับประกันถึง">
                    <DatePicker disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="hoursOfUse" label="ชั่วโมงใช้งาน">
                    <Input placeholder="จำนวนชั่วโมง" readOnly={readOnly} disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="engineNo" label="หมายเลขเครื่อง">
                    <Select mode="tags" notFoundContent={null} disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="peripheralPCode" label="รุ่นอุปกรณ์ต่อพ่วง">
                    <Input placeholder="รุ่นอุปกรณ์ต่อพ่วง" readOnly={readOnly} disabled={disabled} />
                    {/* <ModelSelector
                    style={{ display: 'flex' }}
                    isUsed={false}
                    isVehicle={false}
                  /> */}
                  </Form.Item>
                </Col>
              </Row>
              <Row form>
                <Col md="3">
                  <Form.Item name="vehicleNo" label="หมายเลขรถ">
                    <Select mode="tags" notFoundContent={null} disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="peripheralNo" label="หมายเลขอุปกรณ์">
                    <Select mode="tags" notFoundContent={null} disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="warrantyStatus" label="สถานะรับประกัน">
                    <CommonSelector
                      optionData={['ในประกัน', 'หมดประกัน']}
                      className={values.warrantyStatus === 'ในประกัน' ? 'text-success' : 'text-warning'}
                      disabled={readOnly || disabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="px-3 pt-3 border mb-3">
              <label className="mb-3 text-primary">ความต้องการขอรับบริการ</label>
              <Row>
                <Col md="6">
                  <Row>
                    <Col
                      md={
                        ['periodicCheck', 'periodicCheck_KIS', 'periodicCheck_Beyond'].includes(values.serviceType)
                          ? '8'
                          : '12'
                      }
                    >
                      <Form.Item name="serviceType">
                        <InputGroup
                          spans={[8, 16]}
                          addonBefore="ประเภทงาน"
                          placeholder="ประเภทงาน"
                          inputComponent={props => (
                            <Select
                              name="serviceType"
                              disabled={disabled || readOnly}
                              className="text-primary"
                              {...props}
                            >
                              {Object.keys(ServiceCategories).map(k => (
                                <Select.Option value={k} key={k}>
                                  {ServiceCategories[k]}
                                </Select.Option>
                              ))}
                            </Select>
                          )}
                        />
                      </Form.Item>
                    </Col>
                    {['periodicCheck', 'periodicCheck_KIS', 'periodicCheck_Beyond'].includes(values.serviceType) && (
                      <Col md="4">
                        <Form.Item name="times">
                          <InputGroup
                            spans={[10, 14]}
                            addonBefore="ครั้งที่"
                            placeholder="ครั้งที่"
                            inputComponent={props => (
                              <CommonSelector
                                optionData={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                                disabled={readOnly || disabled}
                                {...props}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </Col>
                <Col md="4">
                  <Form.Item name="notifyChannel">
                    <InputGroup
                      spans={[10, 14]}
                      addonBefore="ช่องทางรับแจ้ง"
                      placeholder="ช่องทางรับแจ้ง"
                      disabled={disabled}
                      readOnly={readOnly}
                    />
                  </Form.Item>
                </Col>
                <Col md="2">
                  <Form.Item name="redo">
                    <Checkbox disabled={disabled || readOnly}>เป็นการซ่อมซ้ำ</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col md="8">
                  <Form.Item name="notifyDetails" label="อาการที่แจ้ง" rules={getRules(['required'])}>
                    <AInput.TextArea disabled={disabled} readOnly={readOnly} />
                  </Form.Item>
                </Col>
                <Col md="4">
                  <Form.Item name="assigner" label="ผู้จ่ายงาน" rules={getRules(['required'])}>
                    <EmployeeSelector disabled={readOnly || disabled} />
                  </Form.Item>
                </Col>
              </Row>
              <label className="text-primary">รายการประเมินราคา</label>
              <Row>
                <Col md="3">
                  <Form.Item name="discountCouponPercent">
                    <InputGroup
                      spans={[12, 8, 4]}
                      addonBefore="คูปองส่วนลด"
                      addonAfter="%"
                      placeholder="%"
                      inputComponent={props => (
                        <CommonSelector
                          optionData={[0, 5, 10, 15, 20, 30, 100]}
                          className="text-success text-center"
                          {...props}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {values.items.length > 0 && values.serviceType !== 'repairDeposit' && (
                <div className="mb-2" style={{ backgroundColor: theme.colors.grey5 }}>
                  <ServiceItems
                    items={values.items}
                    serviceId={values.serviceId}
                    onChange={dat => form.setFieldsValue({ items: dat })}
                    disabled={disabled || readOnly}
                  />
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Form>
  );
};
