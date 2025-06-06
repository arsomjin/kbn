import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { Form } from 'antd';
import { showWarn } from 'functions';
import { columns, initSearchValue, renderHeader } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import PageTitle from 'components/common/PageTitle';
import { CommonSteps } from 'data/Constant';
import { Stepper } from 'elements';

export default () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchValuesRef = useRef(initSearchValue);
  const [form] = Form.useForm();
  const activeStep = 0;

  const _getData = useCallback(async sValues => {
    try {
      setLoading(true);
      let mData = await getSearchData('sections/sales/vehicles', sValues, ['saleNo', 'date']);
      searchValuesRef.current = sValues;
      mData = mData
        .filter(l => !['reservation', 'other'].includes(l.saleType))
        .map((item, id) => {
          let vehicleId = [];
          let peripheralId = [];
          item?.items &&
            item.items.map(it => {
              vehicleId = [...vehicleId, ...it.vehicleId];
              peripheralId = [...peripheralId, ...it.peripheralId];
              return it;
            });
          return {
            ...item,
            vehicleId,
            peripheralId,
            id
          };
        });
      //  showLog({ mData, sValues });
      setData(mData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    _getData(initSearchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = searchValues => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  const handleSelect = record => {
    //  showLog({ record });
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="บันทึกข้อมูล" subtitle="สินเชื่อ skl" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-light"
            steps={CommonSteps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <Form form={form} initialValues={initSearchValue} onValuesChange={onSearch} layout="vertical">
        {values => {
          //  showLog({ values });
          return (
            <>
              {renderHeader()}
              <EditableCellTable
                dataSource={data}
                columns={columns}
                loading={loading}
                // reset={reset}
                onRow={(record, rowIndex) => {
                  return {
                    onClick: () => handleSelect(record)
                  };
                }}
                hasChevron
              />
            </>
          );
        }}
      </Form>
    </Container>
  );
};
