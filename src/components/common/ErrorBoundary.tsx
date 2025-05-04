import React from 'react';
import { Result, Button } from 'antd';
import { logErrorToFirestore } from '../../utils/logErrorToFirestore';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
          status='error'
          title='Something went wrong'
          subTitle='An unexpected error occurred. Please try again or contact support.'
          extra={[
            <Button type='primary' onClick={this.handleReload} key='reload'>
              Reload Page
            </Button>
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
