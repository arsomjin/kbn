import React, { useEffect, useState } from 'react';
import EditableCellTable from 'components/EditableCellTable';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { useHistory, useLocation } from 'react-router';
import { Slide } from 'react-awesome-reveal';
import { CardFooter, Container, Row } from 'shards-react';
import { columns, columns2 } from './api';
import { h, w } from 'api';
import PageHeader from 'components/common/PageHeader';
import { showLog } from 'functions';
import { TableSummary } from 'api/Table';

const SalesByPerson = () => {
  let location = useLocation();

  const params = location.state?.params;

  const [data, setData] = useState([]);

  const history = useHistory();

  useEffect(() => {
    if (params?.data) {
      let mData = params.data.map(l => ({
        ...l,
        ...(!l.vehicleType && { vehicleType: 'อุปกรณ์ต่อพ่วง' })
      }));
      setData(mData);
    }
  }, [params]);

  showLog('sale_by_persons', data);

  return (
    <Slide triggerOnce direction="right" duration={500}>
      <div>
        <div className="px-3">
          <PageHeader
            title={params?.title || 'งานขายรถและอุปกรณ์'}
            subtitle={params?.seller ? `${params?.seller}` : undefined}
          />
        </div>
        <Container fluid className="main-content-container px-4">
          <EditableCellTable
            dataSource={data}
            columns={params?.isSale ? columns : columns2}
            // loading={updating}
            scroll={{ x: isMobile ? w(100) : 840, y: h(50) }}
            size="small"
            summary={pageData => (
              <TableSummary pageData={pageData} dataLength={columns.length} startAt={5} sumKeys={['qty']} />
            )}
          />
          <CardFooter className="border-top">
            <Row form style={{ justifyContent: 'space-between' }}>
              <Button
                onClick={() =>
                  params?.onBack
                    ? history.push(params.onBack.path, {
                        params: params.onBack
                      })
                    : history.goBack()
                }
              >
                &larr; กลับ
              </Button>
            </Row>
          </CardFooter>
          <div style={{ height: 50 }} />
        </Container>
      </div>
    </Slide>
  );
};

export default SalesByPerson;
