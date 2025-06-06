import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'shards-react';

class ModelOwned extends React.Component {
  constructor(props) {
    super(props);

    this.mapRef = React.createRef();

    // this.createGoogleMaps = this.createGoogleMaps.bind(this);
    // this.initCountriesMap = this.initCountriesMap.bind(this);
  }

  // componentDidMount() {
  //   this.createGoogleMaps().then(this.initCountriesMap);
  // }

  render() {
    const { title, data, models } = this.props;

    return (
      <Card small className="country-stats">
        <CardHeader {...(data.length === 0 && { className: 'border-bottom' })}>
          <h6 className="m-0">{title}</h6>
          <div className="block-handle" />
        </CardHeader>

        <CardBody className="p-1 pb-3">
          {data.length === 0 ? (
            <div className="text-center my-4">
              <small className="text-reagent-gray">ไม่มีข้อมูล</small>
            </div>
          ) : (
            // Map Container
            // <div
            //   ref={this.mapRef}
            //   width="100%"
            //   height="100%"
            //   style={{ width: '100%', height: '180px' }}
            // />
            // <Map style={{ width: '100%', height: '180px' }} />

            // Countries Table List
            <table className="table m-0">
              {/* <thead className="py-2 bg-light text-fiord-blue border-bottom">
              <tr>
                <th>สาขา</th>
                <th className="text-right">จำนวนลูกค้า</th>
                <th className="text-right">%</th>
              </tr>
            </thead> */}
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {/* <img
                        className="country-flag mr-1"
                        src={item.flag}
                        alt={item.title}
                      /> */}
                      {item.vehicleType || 'ไม่ระบุ'}
                    </td>
                    <td className="text-right">{item.qty}</td>
                    <td className="text-right">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    );
  }

  createGoogleMaps() {
    if (window.__SDPGoogleChartLoaded__) {
      return new Promise(resolve => {
        resolve();
      });
    }

    window.__SDPGoogleChartLoaded__ = true;

    return new Promise((resolve, reject) => {
      const gmap = document.createElement('script');
      gmap.src = 'https://www.gstatic.com/charts/loader.js';
      gmap.type = 'text/javascript';
      gmap.onload = resolve;
      gmap.onerror = reject;
      document.body.appendChild(gmap);
    });
  }

  initCountriesMap() {
    /* global google */

    google.charts.load('current', {
      packages: ['geochart'],
      mapsApiKey: 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
    });

    google.charts.setOnLoadCallback(() => {
      const data = google.visualization.arrayToDataTable(this.props.mapsData);

      const options = {
        colorAxis: {
          colors: ['#B9C2D4', '#E4E8EF']
        },
        legend: false,
        width: '100%',
        region: 'TH',
        resolution: 'provinces'
      };

      const chart = new google.visualization.GeoChart(this.mapRef.current);

      function drawGeochart() {
        chart.draw(data, options);
      }

      drawGeochart();
      window.addEventListener('resize', drawGeochart);
    });
  }
}

ModelOwned.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The data data.
   */
  data: PropTypes.array,
  /**
   * The map data.
   */
  mapsData: PropTypes.array
};

ModelOwned.defaultProps = {
  title: 'Users by Region',
  data: [
    {
      flag: require('../../../../../images/flags/flag-us.png'),
      title: 'CA-AB',
      visitorsAmount: '12,291',
      visitorsPercentage: '23.32%'
    },
    {
      flag: require('../../../../../images/flags/flag-uk.png'),
      title: 'CA-NS',
      visitorsAmount: '11,192',
      visitorsPercentage: '18.8%'
    }
  ],
  mapsData: [
    ['abv', 'population%'],
    ['TH-BK', 2],
    ['TH-NM', 3]
  ]

  // countries: [
  //   {
  //     flag: require('../../../../../images/flags/flag-us.png'),
  //     title: 'United States',
  //     visitorsAmount: '12,291',
  //     visitorsPercentage: '23.32%',
  //   },
  //   {
  //     flag: require('../../../../../images/flags/flag-uk.png'),
  //     title: 'United Kingdom',
  //     visitorsAmount: '11,192',
  //     visitorsPercentage: '18.8%',
  //   },
  //   {
  //     flag: require('../../../../../images/flags/flag-au.png'),
  //     title: 'Australia',
  //     visitorsAmount: '9,291',
  //     visitorsPercentage: '12.3%',
  //   },
  //   {
  //     flag: require('../../../../../images/flags/flag-jp.png'),
  //     title: 'Japan',
  //     visitorsAmount: '2,291',
  //     visitorsPercentage: '8.14%',
  //   },
  // ],
  // mapsData: [
  //   ['Country', 'Users'],
  //   ['United States', 12219],
  //   ['United Kingdom', 11192],
  //   ['Australia', 9291],
  //   ['Japan', 2291],
  // ],
};

export default ModelOwned;
