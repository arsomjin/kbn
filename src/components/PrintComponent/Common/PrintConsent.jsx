import React from 'react';

export class PrintConsent extends React.PureComponent {
  render() {
    const { title, data } = this.props;
    return (
      <div className="mx-3 mb-5">
        <h6 style={{ textDecorationLine: 'underline' }}>{title}</h6>
        {data.map((it, i) => (
          <div key={i} className="d-flex">
            <div className="mr-1" style={{ fontSize: 15 }}>
              {i + 1}.
            </div>
            <div style={{ flex: 1, fontSize: 15 }}>{it}</div>
          </div>
        ))}
      </div>
    );
  }
}

export const PrintConsentFC = React.forwardRef((props, ref) => {
  // eslint-disable-line max-len
  return <PrintConsent ref={ref} content={props.content} />;
});
