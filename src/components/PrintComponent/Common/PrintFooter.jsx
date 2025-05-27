import { Divider } from 'antd';
import React from 'react';

export class PrintFooter extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div className="mt-5 justify-content-end">
        {children}
        <Divider orientation="right" className="text-muted">
          {`Copyright © ${new Date().getFullYear()} Kubota Benjapol Nakhon Ratchasima`}
        </Divider>
      </div>
    );
  }
}

export const PrintFooterFC = React.forwardRef((props, ref) => {
  // eslint-disable-line max-len
  return <PrintFooter ref={ref} content={props.content} />;
});
