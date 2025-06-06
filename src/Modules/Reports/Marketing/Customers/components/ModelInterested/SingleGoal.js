import React from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem, Col } from 'shards-react';

import Chart from 'utils/chart';

class SingleGoal extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    new Chart(this.canvasRef.current, {
      type: 'doughnut',
      data: this.props.goal.pieData,
      options: {
        legend: false,
        responsive: false,
        cutoutPercentage: 70,
        animation: false,
        tooltips: false
      }
    });
  }

  render() {
    const { goal, models } = this.props;
    return (
      <ListGroupItem className="d-flex row px-0">
        <Col className="col-6" lg="6" md="8" sm="8">
          <h6 className="go-stats__label mb-1">
            {models[goal.interestedModel] ? models[goal.interestedModel].name : 'ไม่ระบุ'}
          </h6>
          <div className="go-stats__meta">
            <span className="mr-2">
              <strong>{goal.counter}</strong> ลูกค้า
            </span>
            {/* <span className="d-block d-sm-inline">
              <strong className="text-success">{goal.value}</strong> มูลค่า
            </span> */}
          </div>
        </Col>
        <Col lg="6" md="4" sm="4" className="d-flex col-6">
          <div className="go-stats__value text-right ml-auto">
            <h6 className="go-stats__label mb-1">{goal.percentage}%</h6>
            <span className="go-stats__meta">อัตราความสนใจ</span>
          </div>
          <div className="go-stats__chart d-flex ml-auto">
            <canvas ref={this.canvasRef} style={{ width: '45px', height: '45px' }} className="my-auto" />
          </div>
        </Col>
      </ListGroupItem>
    );
  }
}

SingleGoal.propTypes = {
  /**
   * The goal object.
   */
  goal: PropTypes.object
};

export default SingleGoal;
