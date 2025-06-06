import React, { useEffect, useRef, useState } from 'react';
import EditableCellTable from 'components/EditableCellTable';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { Slide } from 'react-awesome-reveal';
import { CardFooter, Container, Row } from 'shards-react';
import { getCustomerListColumes } from './api';
import CustomerListHeader from './components/CustomerListHeader';
import { h, w } from 'api';
import { searchArr, showWarn } from 'functions';
import { getAllCustomers } from 'Modules/Utils';

const CustomerList = () => {
  let location = useLocation();
  const params = location.state?.params;
  const isReport = !!params?.data;

  const history = useHistory();

  const headerRef = useRef();
  const [data, setData] = useState([]);

  const { user } = useSelector(state => state.auth);
  const [mCustomers, setCustomers] = useState([]);

  const _init = async () => {
    try {
      let initArr = [];
      if (!params?.data) {
        let cus = await getAllCustomers();
        let mCus = Object.keys(cus).map((k, n) => ({
          ...cus[k],
          id: n,
          key: n
        }));
        setCustomers(mCus);
        initArr = user.branch
          ? mCus.filter(l => l.branch === user.branch).map((it, n) => ({ ...it, key: n, id: n, branchCode: it.branch }))
          : mCus;
      } else {
        initArr = params?.data;
      }

      setData(initArr);
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    _init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onHeaderChange = headerChange => {
    const { branch, searchText } = headerChange;
    headerRef.current = { ...headerRef.current, ...headerChange };
    let dArr = params?.data || (branch && branch !== 'all' ? mCustomers.filter(l => l.branch === branch) : mCustomers);
    if (searchText) {
      dArr = searchArr(dArr, headerChange.searchText, ['firstName', 'lastName', 'phoneNumber', 'customerNo']);
    }
    dArr = dArr.map((it, n) => ({
      ...it,
      key: n,
      id: n,
      branchCode: it.branch
    }));
    setData(dArr);
    //  showLog({ headerChange, headerRef: headerRef.current, dArr });
  };

  const handleSelect = record => {
    //  showLog({ record });
    history.push('/customer-details', {
      params: { selectedCustomer: record || {} }
    });
  };

  //  showLog({ params, location, data });

  const columns = getCustomerListColumes(isReport);

  return (
    <Slide triggerOnce direction="right" duration={500}>
      <div>
        <Container fluid className="main-content-container px-4">
          <CustomerListHeader
            title="รายชื่อลูกค้า"
            subtitle="Customers List"
            onChange={_onHeaderChange}
            hideBranch={isReport}
          />
          <EditableCellTable
            dataSource={data}
            columns={columns}
            // loading={updating}
            scroll={{ x: isMobile ? w(100) : 840, y: h(50) }}
            size="small"
            onRow={(record, rowIndex) => {
              return {
                onClick: () => handleSelect(record)
              };
            }}
            hasChevron
          />
          <CardFooter className="border-top">
            <Row form style={{ justifyContent: 'space-between' }}>
              <Button
                onClick={() =>
                  params?.mCustomers
                    ? history.push('/reports/mkt/customers', {
                        params: { mCustomers: params.mCustomers }
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

export default CustomerList;
