import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody, Button } from 'shards-react';

import RangeDatePicker from '../../../components/common/RangeDatePicker';
import Chart from 'utils/chart';
import moment from 'moment';
import { checkCollection } from 'firebase/api';
import { showWarn } from 'functions';
import { getDates } from 'functions';
import { distinctArr } from 'functions';
import { useHistory } from 'react-router-dom';

const IncomeChart = props => {
  let isMounted = true;
  const [data, setData] = useState(props.chartData);
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const canvasRef = useRef();
  const rangeRef = useRef([moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);

  useEffect(() => {
    isMounted = true;
    _getChartData(rangeRef.current);
    return () => {
      isMounted = false;
    };
  }, []);

  const _getChartData = async range => {
    try {
      setLoading(true);
      if (!isMounted) return;
      let mData = {};
      let dArr = getDates(range[0], range[1], 'YYYY-MM-DD');
      let arr = dArr.map(v => {
        mData[v] = {
          date: v,
          label: moment(v, 'YYYY-MM-DD').format('D-MMM'),
          v: 0,
          p: 0,
          s: 0,
          p_v: 0,
          p_p: 0,
          p_s: 0
        };
        return v;
      });

      const vSnap = await checkCollection('reports/sales/vehicles', [
        ['date', '>=', range[0]],
        ['date', '<=', range[1]]
      ]);
      const pSnap = await checkCollection('reports/sales/parts', [
        ['saleDate', '>=', range[0]],
        ['saleDate', '<=', range[1]]
      ]);
      const sSnap = await checkCollection('reports/services/all', [
        ['docDate', '>=', range[0]],
        ['docDate', '<=', range[1]]
      ]);
      const prev_vSnap = await checkCollection('reports/sales/vehicles', [
        ['date', '>=', moment(range[0], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')],
        ['date', '<=', moment(range[1], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')]
      ]);
      const prev_pSnap = await checkCollection('reports/sales/parts', [
        ['saleDate', '>=', moment(range[0], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')],
        ['saleDate', '<=', moment(range[1], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')]
      ]);
      const prev_sSnap = await checkCollection('reports/services/all', [
        ['docDate', '>=', moment(range[0], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')],
        ['docDate', '<=', moment(range[1], 'YYYY-MM-DD').subtract(1, 'month').format('YYYY-MM-DD')]
      ]);
      if (vSnap) {
        let items = [];
        vSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['date'], ['amtFull']);
        items.map(it => {
          mData[it.date].v = it.amtFull;
          return it;
        });
      }
      if (prev_vSnap) {
        let items = [];
        prev_vSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['date'], ['amtFull']);
        items.map(it => {
          mData[moment(it.date, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD')].p_v = it.amtFull || 0;
          return it;
        });
      }
      if (pSnap) {
        let items = [];
        pSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['saleDate'], ['netTotal']);
        items.map(it => {
          mData[it.saleDate].p = it.netTotal;
          return it;
        });
      }
      if (prev_pSnap) {
        let items = [];
        prev_pSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['saleDate'], ['netTotal']);
        items.map(it => {
          mData[moment(it.saleDate, 'YYYY-MM-DD').add(1, 'months').format('YYYY-MM-DD')].p_p = it.netTotal;
          return it;
        });
      }
      if (sSnap) {
        let items = [];
        sSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['docDate'], ['netPrice']);
        items.map(it => {
          mData[it.docDate].s = it.netPrice;
          return it;
        });
      }
      if (prev_sSnap) {
        let items = [];
        prev_sSnap.forEach(doc => {
          items.push(doc.data());
        });
        items = distinctArr(items, ['docDate'], ['netPrice']);
        items.map(it => {
          mData[moment(it.docDate, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD')].p_s = it.netPrice;
          return it;
        });
      }
      let arrData = Object.keys(mData).map(dat => {
        const { p, v, s, p_p, p_v, p_s } = mData[dat];
        return {
          ...mData[dat],
          current: p + v + s,
          prev: p_v + p_p + p_s
        };
      });
      let dataSet1 = arrData.map(d => d.current);
      let dataSet2 = arrData.map(d => d.prev);
      let labels = arrData.map(d => d.label);

      let cData = { ...data };
      cData.datasets[0].data = dataSet1;
      cData.datasets[1].data = dataSet2;
      cData.labels = labels;
      if (!isMounted) return;
      setData(cData);
      if (!isMounted) return;
      setLoading(false);
    } catch (e) {
      showWarn(e);
      if (!isMounted) return;
      setLoading(false);
    }
  };

  const _onStartDateChange = val => {
    rangeRef.current[0] = moment(val).format('YYYY-MM-DD');
    _getChartData(rangeRef.current);
  };
  const _onEndDateChange = val => {
    rangeRef.current[1] = moment(val).format('YYYY-MM-DD');
    _getChartData(rangeRef.current);
  };

  useEffect(() => {
    const chartOptions = {
      ...{
        responsive: true,
        legend: {
          position: 'top'
        },
        elements: {
          line: {
            tension: 0.3
          },
          point: {
            radius: 0
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: false,
              ticks: {
                callback(tick, index) {
                  return index % 7 !== 0 ? '' : tick;
                }
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                suggestedMax: 45,
                callback(tick) {
                  if (tick === 0) {
                    return tick;
                  }
                  return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                }
              }
            }
          ]
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        tooltips: {
          custom: false,
          mode: 'nearest',
          intersect: false
        }
      },
      ...props.chartOptions
    };

    const BlogIncomeChart = new Chart(canvasRef.current, {
      type: 'LineWithLine',
      data,
      options: chartOptions
    });

    const buoMeta = BlogIncomeChart.getDatasetMeta(0);
    buoMeta.data[0]._model.radius = 0;
    buoMeta.data[data.datasets[0].data.length - 1]._model.radius = 0;

    BlogIncomeChart.render();
  }, [data, props.chartOptions]);

  return (
    <Card small className="h-100">
      <CardHeader className="border-bottom">
        <Row>
          <Col>
            <h6 className="m-0">{props.title}</h6>
          </Col>
        </Row>
      </CardHeader>
      <CardBody className="pt-0">
        <Row className="border-bottom py-2 bg-light">
          <Col sm="6" className="d-flex mb-2 mb-sm-0">
            <RangeDatePicker onStartDateChange={_onStartDateChange} onEndDateChange={_onEndDateChange} />
          </Col>
          <Col>
            <Button
              onClick={() => history.push('/reports/sale-analytics')}
              size="sm"
              className="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
            >
              ดูรายงานฉบับเต็ม &rarr;
            </Button>
          </Col>
        </Row>
        <canvas height="150" ref={canvasRef} style={{ maxWidth: '100% !important' }} />
      </CardBody>
    </Card>
  );
};

IncomeChart.propTypes = {
  title: PropTypes.string,
  chartData: PropTypes.object,
  chartOptions: PropTypes.object
};

IncomeChart.defaultProps = {
  title: 'ยอดขายรวม',
  chartData: {
    labels: Array.from(new Array(30), (_, i) => (i === 0 ? 1 : i)),
    datasets: [
      {
        label: 'ปัจจุบัน',
        fill: 'start',
        data: Array.from(new Array(30), (_, i) => 0),
        backgroundColor: 'rgba(0,123,255,0.1)',
        borderColor: 'rgba(0,123,255,1)',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: 'rgb(0,123,255)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3
      },
      {
        label: 'ก่อนหน้า',
        fill: 'start',
        data: Array.from(new Array(30), (_, i) => 0),
        backgroundColor: 'rgba(255,65,105,0.1)',
        borderColor: 'rgba(255,65,105,1)',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: 'rgba(255,65,105,1)',
        borderDash: [3, 3],
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 2,
        pointBorderColor: 'rgba(255,65,105,1)'
      }
    ]
  }
};

export default IncomeChart;
