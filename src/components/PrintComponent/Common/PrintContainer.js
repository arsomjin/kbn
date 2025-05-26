import React from 'react';

export class PrintContainer extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div
        className="d-flex flex-column bg-white"
        style={{
          padding: 40,
          paddingLeft: 66,
          paddingRight: 66,
          height: '100%'
        }}
      >
        {children}
      </div>
    );
  }
}

export const PrintContainerFC = React.forwardRef((props, ref) => {
  // eslint-disable-line max-len
  return <PrintContainer ref={ref} content={props.content} />;
});
