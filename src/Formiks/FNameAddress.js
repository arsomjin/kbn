import { SearchSelect } from 'elements';
import { FInput } from 'Formiks';
import { FPrefix } from 'Formiks';
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col } from 'shards-react';
import { Tambols, Provinces } from 'data/thaiTambol';
import { getPostcodeFromProvince } from 'data/thaiTambol';
import { getAmphoesFromProvince } from 'data/thaiTambol';
import { getTambolsFromAmphoe } from 'data/thaiTambol';
import { getPostcodeFromProvinceAndAmphoe } from 'data/thaiTambol';

export default ({ values, errors, setFieldValue, handleBlur, disabled, defaultProvince, noCareer }) => {
  const [TAMBOLS, setTambols] = useState([]);
  const [AMPHOES, setAmphoes] = useState([]);
  const [PROVINCES, setProvinces] = useState(Provinces());
  const [POSTCODES, setPostcodes] = useState(getPostcodeFromProvince(defaultProvince || 'นครราชสีมา'));

  const _getProvincesDB = useCallback(async () => {
    let mProvinces = Provinces().map(pv => ({
      value: pv.p,
      label: pv.p
    }));
    // Move korat to first element.
    mProvinces.forEach(function (item, i) {
      if (item.value === 'นครราชสีมา') {
        mProvinces.splice(i, 1);
        mProvinces.unshift(item);
      }
    });
    //  showLog({ origLen: Provinces().length, newLen: mProvinces.length });
    setProvinces(mProvinces);
  }, []);

  useEffect(() => {
    _getProvincesDB();
    _onProvinceSelect('นครราชสีมา');
  }, [_getProvincesDB]);

  const _onProvinceSelect = async pv => {
    //  showLog('pv', pv);

    let mAmphoes = getAmphoesFromProvince(pv);
    mAmphoes = mAmphoes.map(ap => ({
      value: ap.a,
      label: ap.a
    }));
    let mPostcodes = getPostcodeFromProvince(pv);
    mPostcodes = mPostcodes.map(ap => ({
      value: ap.z,
      label: ap.z
    }));
    setAmphoes(mAmphoes);
    setPostcodes(mPostcodes);
  };

  const _onAmphoeSelect = async (ap, pv) => {
    let mTambols = getTambolsFromAmphoe(ap);
    let nextPostcode = getPostcodeFromProvinceAndAmphoe(pv, ap);
    let fPostcodes = nextPostcode.map(l => ({ value: l.z, label: l.z }));
    //  showLog({ fPostcodes });
    setTambols(mTambols);
    setPostcodes(fPostcodes);
  };

  const _onTambolSelect = (tb, values, setFieldValue) => {
    //  showLog({ tb, values });
    //  showLog({ Tambols });
    const { amphoe, province } = values;
    const pc = Tambols.findIndex(l => l.p === province && l.a === amphoe && l.d === tb);
    if (pc !== -1) {
      setFieldValue('postcode', Tambols[pc].z);
    }
  };

  return (
    <>
      <Row form>
        <Col md="4" className="form-group">
          <FPrefix name="prefix" disabled={disabled} />
        </Col>
        <Col md="4" className="form-group">
          <label>ชื่อ</label>
          <FInput name="firstName" placeholder="ชื่อ" disabled={disabled} />
        </Col>
        {/* นามสกุล */}
        {!['หจก.', 'บจก.', 'บมจ.'].includes(values.prefix) && (
          <Col md="4" className="form-group">
            <label>นามสกุล</label>
            <FInput name="lastName" placeholder="นามสกุล" disabled={disabled} />
          </Col>
        )}
      </Row>
      <Row form>
        <Col md="4" className="form-group">
          <label>เบอร์โทร</label>
          <FInput type="text" name="phoneNumber" placeholder="เบอร์โทร" disabled={disabled} />
        </Col>
        {!noCareer && (
          <Col md="4" className="form-group">
            <label>อาชีพ</label>
            <FInput type="text" name="career" placeholder="อาชีพ" disabled={disabled} />
          </Col>
        )}
        <Col md="4" className="form-group">
          <label>ที่อยู่</label>
          <FInput type="text" name="address" placeholder="ที่อยู่" disabled={disabled} />
        </Col>
      </Row>
      <Row form>
        <Col md="4" className="form-group">
          <label>หมู่</label>
          <FInput type="text" name="moo" placeholder="หมู่" disabled={disabled} />
        </Col>
        <Col md="4" className="form-group">
          <label>บ้าน</label>
          <FInput type="text" name="village" placeholder="บ้าน" disabled={disabled} />
        </Col>
        <Col md="4" className="form-group">
          <label>จังหวัด</label>
          <SearchSelect
            id={'province'}
            type={'text'}
            placeholder="จังหวัด"
            value={{
              value: values.province,
              label: values.province
            }}
            // inputValue={values.province}
            error={errors.province}
            onChange={val => {
              //  showLog('select_province', val);
              setFieldValue('province', val.value);
              _onProvinceSelect(val.value);
            }}
            // onInputChange={(txt) => setQuery(txt)}
            options={PROVINCES}
            onBlur={handleBlur}
          />
        </Col>
      </Row>
      <Row form>
        <Col md="4" className="form-group">
          <label>อำเภอ</label>
          <SearchSelect
            id={'amphoe'}
            type={'text'}
            placeholder="อำเภอ"
            value={{
              value: values.amphoe,
              label: values.amphoe
            }}
            error={errors.amphoe}
            onChange={val => {
              setFieldValue('amphoe', val.value);
              _onAmphoeSelect(val.value, values.province);
            }}
            // onInputChange={(txt) => setQuery(txt)}
            options={AMPHOES}
            onBlur={handleBlur}
          />
        </Col>
        <Col md="4" className="form-group">
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
              _onTambolSelect(val.value, values, setFieldValue);
            }}
            // onInputChange={(txt) => setQuery(txt)}
            options={TAMBOLS}
            onBlur={handleBlur}
            noOptionsMessage="กรุณาเลือกอำเภอ"
          />
        </Col>
        <Col md="4" className="form-group">
          <label>รหัสไปรษณีย์</label>
          <SearchSelect
            id={'postcode'}
            type={'text'}
            placeholder="รหัสไปรษณีย์"
            value={{
              value: values.postcode,
              label: values.postcode
            }}
            error={errors.postcode}
            onChange={val => {
              setFieldValue('postcode', val.value);
            }}
            // onInputChange={(txt) => setQuery(txt)}
            options={POSTCODES}
            onBlur={handleBlur}
          />
          {/* <TextInput
      type="text"
      name="postcode"
      placeholder="รหัสไปรษณีย์"
      error={errors.postcode}
      value={values.postcode}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
    /> */}
        </Col>
      </Row>
    </>
  );
};
