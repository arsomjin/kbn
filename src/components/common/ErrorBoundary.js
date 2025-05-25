import React from 'react';
import { Result, Button } from 'antd';
import { logErrorToFirestore } from '../../utils/logErrorToFirestore';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    await logErrorToFirestore(error, { errorInfo });
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error boundary caught:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="An unexpected error occurred. Please try again or contact support."
          extra={[
            <Button type="primary" onClick={this.handleReload} key="reload">
              Reload Page
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ color: 'red', marginTop: 16 }}>
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </Result>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
