import dayjs from 'dayjs';
import React from 'react';

export class PrintSignBox extends React.PureComponent {
  render() {
    const { title, name, date } = this.props;
    return (
      <div className="d-flex flex-column align-items-center mb-4 mt-5">
        <div style={{ flex: 1, fontSize: 15 }}>____________________________ {title || 'ลายมือชื่อ'}</div>
        <div
          className="mt-3 mr-3"
          style={{
            flex: 1,
            fontSize: 15,
            ...(name && { textDecorationLine: 'underline' })
          }}
        >
          {name ? `( ${name} )` : '( ____________________________ )'}
        </div>
        <div
          className="mt-3 mr-3"
          style={{
            flex: 1,
            fontSize: 15,
            ...(date && { textDecorationLine: 'underline' })
          }}
        >
          {date ? `วันที่  ${dayjs(date, 'YYYY-MM-DD').format('D/MM/YYYY')}` : 'วันที่ _______/________/__________'}
        </div>
      </div>
    );
  }
}

export const PrintSignBoxFC = React.forwardRef((props, ref) => {
  // eslint-disable-line max-len
  return <PrintSignBox ref={ref} content={props.content} />;
});
