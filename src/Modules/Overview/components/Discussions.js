import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, CardFooter, ButtonGroup, Button, Row, Col } from 'shards-react';
import { showToBeContinue } from 'functions';
import NoData from 'components/NoData';

const Discussions = ({ title, discussions }) => (
  <Card small className="blog-comments">
    <CardHeader className="border-bottom">
      <h6 className="m-0">{title}</h6>
    </CardHeader>

    <CardBody className="p-0">
      {discussions.length > 0 ? (
        discussions.map((discussion, idx) => (
          <div key={idx} className="blog-comments__item d-flex p-3">
            {/* Avatar */}
            <div className="blog-comments__avatar mr-3">
              <img src={discussion.author.image} alt={discussion.author.name} />
            </div>

            {/* Content */}
            <div className="blog-comments__content">
              {/* Content :: Title */}
              <div className="blog-comments__meta text-mutes">
                <a className="text-secondary" href={discussion.author.url}>
                  {discussion.author.name}
                </a>{' '}
                ที่{' '}
                <a className="text-secondary" href={discussion.post.url}>
                  {discussion.post.title}
                </a>
                <span className="text-mutes">- {discussion.date}</span>
              </div>

              {/* Content :: Body */}
              <p className="m-0 my-1 mb-2 text-muted">{discussion.body}</p>

              {/* Content :: Actions */}
              <div className="blog-comments__actions">
                <ButtonGroup size="sm">
                  <Button onClick={() => showToBeContinue()} theme="white">
                    <span className="text-success">
                      <i className="material-icons">check</i>
                    </span>{' '}
                    อนุมัติ
                  </Button>
                  <Button onClick={() => showToBeContinue()} theme="white">
                    <span className="text-danger">
                      <i className="material-icons">clear</i>
                    </span>{' '}
                    ลบ
                  </Button>
                  <Button onClick={() => showToBeContinue()} theme="white">
                    <span className="text-light">
                      <i className="material-icons">more_vert</i>
                    </span>{' '}
                    แก้ไข
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        ))
      ) : (
        <NoData />
      )}
    </CardBody>

    <CardFooter className="border-top">
      <Row>
        <Col className="text-center view-report">
          <Button onClick={() => showToBeContinue()} theme="white" type="submit">
            ดูทั้งหมด
          </Button>
        </Col>
      </Row>
    </CardFooter>
  </Card>
);

Discussions.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The discussions dataset.
   */
  discussions: PropTypes.array
};

Discussions.defaultProps = {
  title: 'Highlight',
  discussions: [],
  discussions_bak: [
    {
      id: 1,
      date: '3 วันที่แล้ว',
      author: {
        image: require('images/avatars/1.jpg'),
        name: 'แสวง บุญพา',
        url: '#'
      },
      post: {
        title: 'หนองบุญมาก!',
        url: '#'
      },
      body: 'งานบริการนอกพื้นที่ ยอดสูงสุดของหนองบุญมาก ...'
    },
    {
      id: 2,
      date: '4 วันที่แล้ว',
      author: {
        image: require('images/avatars/2.jpg'),
        name: 'พงษ์ศักดิ์ ขยันยิ่ง',
        url: '#'
      },
      post: {
        title: 'จักราช!',
        url: '#'
      },
      body: 'ขายรถได้ 3 คัน...'
    },
    {
      id: 3,
      date: '5 วันที่แล้ว',
      author: {
        image: require('images/avatars/3.jpg'),
        name: 'สามารถ สมดังหวัง',
        url: '#'
      },
      post: {
        title: 'สำนักงานใหญ่!',
        url: '#'
      },
      body: 'รับยอดจองล่วงหน้าสูงสุด!...'
    }
  ]
};

export default Discussions;
