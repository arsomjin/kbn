import React, { useContext, useEffect, useRef } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, Button, FormTextarea } from 'shards-react';
import { isMobile } from 'react-device-detect';
import { Formik } from 'formik';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector, useDispatch } from 'react-redux';
import { setLocations } from 'redux/actions/data';
import { TextInput } from 'elements';
import { getTambolsFromAmphoe } from 'data/thaiTambol';
import { SearchSelect } from 'elements';
import { getChanges } from 'functions';

const SettingLocation = ({ location, onCancel, hideMain }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { locations } = useSelector(state => state.data);

  const provinceRef = useRef(null);

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission602);

  const dispatch = useDispatch();

  useEffect(() => {
    isMobile && window.scrollTo(0, 100);
    return () => isMobile && window.scrollTo(0, 100);
  }, []);

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      const mLocations = JSON.parse(JSON.stringify(locations));
      mLocations[values.locationId] = values;
      await api.setLocation(values);
      dispatch(setLocations(mLocations));
      const oldValues = location;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.updateData('locations', values.locationId);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.locationId,
          changes
        },
        'locations',
        values.locationId
      );

      showSuccess(
        () => onCancel(),
        `บันทึกข้อมูล สถานที่ ${values.tambol === 'โคกกรวด' ? values.tambol : values.amphoe} สำเร็จ`
      );
      onCancel && onCancel();
      // alert('Done!');
    } catch (e) {
      showWarn(e);
    }
  };
  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            locationId: location.locationId || '',
            address: location.address || '',
            tambol: location.tambol || '',
            amphoe: location.amphoe || '',
            province: location.province || '',
            postcode: location.postcode || '',
            country: location.country || '',
            remark: location.remark || ''
          }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              _onConfirm(values);
              setSubmitting(false);
            }, 400);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue
            /* and other goodies */
          }) => (
            <Form>
              <Row form>
                {/* First Name */}
                <Col md="3" className="form-group">
                  <label>รหัสสถานที่</label>
                  <TextInput
                    name="locationId"
                    placeholder="รหัสสถานที่"
                    value={values.locationId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label>ที่อยู่</label>
                  <TextInput
                    name="address"
                    placeholder="ที่อยู่"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!grantBranch}
                  />
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label>ตำบล</label>
                  <label>ตำบล</label>
                  <SearchSelect
                    id={'tambol'}
                    type={'text'}
                    placeholder="ตำบล"
                    value={{
                      value: values.tambol,
                      label: values.tambol
                    }}
                    error={errors.tambol}
                    onChange={val => {
                      setFieldValue('tambol', val.value);
                    }}
                    // onInputChange={(txt) => setQuery(txt)}
                    options={getTambolsFromAmphoe(values.amphoe)}
                    onBlur={handleBlur}
                    focusNextField={3}
                  />
                  {/* <TextInput
                    name="tambol"
                    placeholder="ตำบล"
                    value={values.tambol}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!grantBranch}
                    focusNextField={3}
                  /> */}
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label>อำเภอ</label>
                  <TextInput
                    name="amphoe"
                    placeholder="อำเภอ"
                    value={values.amphoe}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label>จังหวัด</label>
                  <TextInput
                    ref={provinceRef}
                    name="province"
                    placeholder="จังหวัด"
                    value={values.province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label>รหัสไปรษณีย์</label>
                  <TextInput
                    name="postcode"
                    placeholder="รหัสไปรษณีย์"
                    value={values.postcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!grantBranch}
                  />
                </Col>
              </Row>
              <Row form>
                <Col className="form-group">
                  <label htmlFor="feInputCity">หมายเหตุ</label>
                  <FormTextarea
                    name="remark"
                    placeholder="หมายเหตุ"
                    value={values.remark}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!grantBranch}
                  />
                </Col>
              </Row>
              {/* <FormGroup>
                <label htmlFor="feInputAddress">หมายเหตุ</label>
                <TextInput id="feInputAddress" value="เงินโอน" />
              </FormGroup> */}
              <Row style={{ justifyContent: 'flex-end' }} form>
                <Button className="btn-white mr-3" onClick={onCancel}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  theme="accent"
                  // className="d-flex ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                >
                  บันทึก
                </Button>
              </Row>
            </Form>
          )}
        </Formik>
      </ListGroupItem>
    </ListGroup>
  );
};

export default SettingLocation;
