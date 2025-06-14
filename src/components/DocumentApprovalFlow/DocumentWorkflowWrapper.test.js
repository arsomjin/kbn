/**
 * DocumentWorkflowWrapper Comprehensive Test Suite
 *
 * Tests all scenarios and edge cases to ensure 100% reliability
 * before mass integration across 80+ components
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';

import DocumentWorkflowWrapper from './DocumentWorkflowWrapper';

// Mock dependencies
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn((permission) => {
      // Mock permission logic
      const mockPermissions = {
        'accounting.view': true,
        'accounting.edit': true,
        'accounting.approve': true,
        'sales.view': true,
        'sales.edit': false,
        'sales.approve': false,
      };
      return mockPermissions[permission] || false;
    }),
    userRBAC: {
      accessLevel: 'ACCOUNTING_STAFF',
      displayName: 'Test User',
      provinces: ['NMA'],
      branches: ['0450'],
    },
  }),
}));

jest.mock('../../hooks/useAuditTrail', () => ({
  useAuditTrail: () => ({
    isProcessing: false,
    saveWithCompleteAudit: jest.fn(),
    updateStatus: jest.fn(),
    approveDocument: jest.fn(),
    rejectDocument: jest.fn(),
    permissions: {
      canView: true,
      canEdit: true,
      canApprove: true,
    },
  }),
}));

jest.mock('../layout/LayoutWithRBAC', () => {
  return function MockLayoutWithRBAC({ children, ...props }) {
    return (
      <div data-testid='layout-with-rbac' data-props={JSON.stringify(props)}>
        {children}
      </div>
    );
  };
});

jest.mock('./DocumentApprovalFlow', () => {
  const mockConfigs = {
    invoice: {
      department: 'accounting',
      steps: [
        {
          title: 'สร้างใบแจ้งหนี้',
          status: 'draft',
          permission: 'accounting.edit',
        },
        { title: 'ตรวจสอบ', status: 'review', permission: 'accounting.review' },
        {
          title: 'อนุมัติ',
          status: 'approved',
          permission: 'accounting.approve',
        },
        {
          title: 'เสร็จสิ้น',
          status: 'completed',
          permission: 'accounting.view',
        },
      ],
      statusLabels: {
        draft: 'ฉบับร่าง',
        review: 'รอตรวจสอบ',
        approved: 'อนุมัติแล้ว',
        completed: 'เสร็จสิ้น',
      },
    },
    generic: {
      department: 'general',
      steps: [
        { title: 'สร้าง', status: 'draft', permission: 'general.edit' },
        { title: 'เสร็จสิ้น', status: 'completed', permission: 'general.view' },
      ],
      statusLabels: {
        draft: 'ฉบับร่าง',
        completed: 'เสร็จสิ้น',
      },
    },
  };

  return {
    __esModule: true,
    default: function MockDocumentApprovalFlow(props) {
      return (
        <div
          data-testid='document-approval-flow'
          data-props={JSON.stringify(props)}
        >
          Document Approval Flow
        </div>
      );
    },
    DOCUMENT_APPROVAL_CONFIGS: mockConfigs,
  };
});

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Test store setup
const mockReducer = (state = {}, action) => state;
const store = createStore(combineReducers({ mock: mockReducer }));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

// Mock child component
const MockChildComponent = (props) => (
  <div data-testid='child-component' data-props={JSON.stringify(props)}>
    Mock Child Component
  </div>
);

describe('DocumentWorkflowWrapper', () => {
  let mockOnDocumentSave;
  let mockOnDocumentLoad;
  let mockOnStatusChange;
  let mockOnStepChange;

  beforeEach(() => {
    mockOnDocumentSave = jest.fn().mockResolvedValue();
    mockOnDocumentLoad = jest.fn().mockResolvedValue({
      id: 'TEST-001',
      status: 'draft',
      currentStep: 0,
      data: 'test data',
    });
    mockOnStatusChange = jest.fn().mockResolvedValue();
    mockOnStepChange = jest.fn().mockResolvedValue();

    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with minimal required props', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper documentId='TEST-001' documentType='invoice'>
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-with-rbac')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    test('renders with all props', () => {
      const documentData = {
        id: 'TEST-001',
        status: 'review',
        currentStep: 1,
        data: 'test data',
      };

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={documentData}
            onDocumentSave={mockOnDocumentSave}
            onDocumentLoad={mockOnDocumentLoad}
            title='Test Title'
            subtitle='Test Subtitle'
            permission='accounting.view'
            showApprovalFlow={true}
            showStepper={true}
            showAuditTrail={true}
            onStatusChange={mockOnStatusChange}
            onStepChange={mockOnStepChange}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-with-rbac')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByTestId('document-approval-flow')).toBeInTheDocument();
    });
  });

  describe('Document Type Configuration', () => {
    test('uses predefined configuration for known document types', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper documentId='TEST-001' documentType='invoice'>
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const layoutProps = JSON.parse(
        screen.getByTestId('layout-with-rbac').getAttribute('data-props')
      );

      expect(layoutProps.permission).toBe('accounting.view');
      expect(layoutProps.editPermission).toBe('accounting.edit');
    });

    test('uses generic configuration for unknown document types', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='unknown_type'
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const layoutProps = JSON.parse(
        screen.getByTestId('layout-with-rbac').getAttribute('data-props')
      );

      expect(layoutProps.permission).toBe('general.view');
      expect(layoutProps.editPermission).toBe('general.edit');
    });

    test('uses custom configuration when provided', () => {
      const customConfig = {
        department: 'custom',
        steps: [
          { title: 'Custom Step', status: 'custom', permission: 'custom.edit' },
        ],
        statusLabels: {
          custom: 'Custom Status',
        },
      };

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            customApprovalConfig={customConfig}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const layoutProps = JSON.parse(
        screen.getByTestId('layout-with-rbac').getAttribute('data-props')
      );

      expect(layoutProps.permission).toBe('custom.view');
      expect(layoutProps.editPermission).toBe('custom.edit');
    });
  });

  describe('Document State Management', () => {
    test('initializes with document data', () => {
      const documentData = {
        id: 'TEST-001',
        status: 'review',
        currentStep: 1,
        data: 'test data',
      };

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={documentData}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      expect(childProps.currentStatus).toBe('review');
      expect(childProps.currentStep).toBe(1);
      expect(childProps.documentData).toEqual(documentData);
    });

    test('loads document on mount when onDocumentLoad provided', async () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            onDocumentLoad={mockOnDocumentLoad}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockOnDocumentLoad).toHaveBeenCalledWith('TEST-001');
      });
    });

    test('updates state when document data changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      // Update document data
      rerender(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'approved', currentStep: 2 }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      expect(childProps.currentStatus).toBe('approved');
      expect(childProps.currentStep).toBe(2);
    });
  });

  describe('Enhanced Children Props', () => {
    test('passes all required props to children', () => {
      const documentData = {
        id: 'TEST-001',
        status: 'draft',
        currentStep: 0,
      };

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={documentData}
            onDocumentSave={mockOnDocumentSave}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Document context
      expect(childProps.documentId).toBe('TEST-001');
      expect(childProps.documentType).toBe('invoice');
      expect(childProps.documentData).toEqual(documentData);
      expect(childProps.currentStatus).toBe('draft');
      expect(childProps.currentStep).toBe(0);

      // Workflow functions
      expect(childProps.onSave).toBeDefined();
      expect(childProps.onStatusChange).toBeDefined();
      expect(childProps.onStepChange).toBeDefined();
      expect(childProps.onApprove).toBeDefined();
      expect(childProps.onReject).toBeDefined();
      expect(childProps.onSubmit).toBeDefined();

      // Permission helpers
      expect(childProps.permissions).toBeDefined();
      expect(childProps.permissions.canView).toBe(true);
      expect(childProps.permissions.canEdit).toBe(true);
      expect(childProps.permissions.canApprove).toBe(true);

      // Configuration
      expect(childProps.approvalConfig).toBeDefined();

      // State
      expect(childProps.isLoading).toBe(false);
    });
  });

  describe('Workflow Operations', () => {
    test('handles status change', async () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
            onDocumentSave={mockOnDocumentSave}
            onStatusChange={mockOnStatusChange}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Simulate status change
      await act(async () => {
        await childProps.onStatusChange('review', { additionalData: 'test' });
      });

      expect(mockOnDocumentSave).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'review',
          additionalData: 'test',
          lastModifiedAt: expect.any(Number),
        })
      );
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        'review',
        expect.any(Object)
      );
      expect(message.success).toHaveBeenCalledWith('อัปเดตสถานะเรียบร้อย');
    });

    test('handles step change', async () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
            onDocumentSave={mockOnDocumentSave}
            onStepChange={mockOnStepChange}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Simulate step change
      await act(async () => {
        await childProps.onStepChange(1, { stepData: 'test' });
      });

      expect(mockOnDocumentSave).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 1,
          stepData: 'test',
          lastModifiedAt: expect.any(Number),
        })
      );
      expect(mockOnStepChange).toHaveBeenCalledWith(1, expect.any(Object));
      expect(message.success).toHaveBeenCalledWith(
        'ไปยังขั้นตอนถัดไปเรียบร้อย'
      );
    });

    test('handles approval', async () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'review', currentStep: 1 }}
            onDocumentSave={mockOnDocumentSave}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Simulate approval
      await act(async () => {
        await childProps.onApprove({
          status: 'approved',
          step: 2,
          approvalComment: 'Approved by test',
        });
      });

      expect(mockOnDocumentSave).toHaveBeenCalledTimes(2); // Once for status, once for step
      expect(message.success).toHaveBeenCalledWith('อนุมัติเอกสารเรียบร้อย');
    });

    test('handles rejection', async () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'review', currentStep: 1 }}
            onDocumentSave={mockOnDocumentSave}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Simulate rejection
      await act(async () => {
        await childProps.onReject({
          rejectionReason: 'Invalid data',
        });
      });

      expect(mockOnDocumentSave).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'rejected',
          rejectionReason: 'Invalid data',
        })
      );
      expect(message.success).toHaveBeenCalledWith('ปฏิเสธเอกสารเรียบร้อย');
    });
  });

  describe('Error Handling', () => {
    test('handles document load error', async () => {
      const mockOnDocumentLoadError = jest
        .fn()
        .mockRejectedValue(new Error('Load failed'));

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            onDocumentLoad={mockOnDocumentLoadError}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('ไม่สามารถโหลดเอกสารได้');
      });
    });

    test('handles save error', async () => {
      const mockOnDocumentSaveError = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
            onDocumentSave={mockOnDocumentSaveError}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const childProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Simulate status change that will fail
      await act(async () => {
        try {
          await childProps.onStatusChange('review');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(message.error).toHaveBeenCalledWith('ไม่สามารถอัปเดตสถานะได้');
    });
  });

  describe('Conditional Rendering', () => {
    test('shows approval flow when enabled and documentId exists', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            showApprovalFlow={true}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(screen.getByTestId('document-approval-flow')).toBeInTheDocument();
    });

    test('hides approval flow when disabled', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            showApprovalFlow={false}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('document-approval-flow')
      ).not.toBeInTheDocument();
    });

    test('hides approval flow when no documentId', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId=''
            documentType='invoice'
            showApprovalFlow={true}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('document-approval-flow')
      ).not.toBeInTheDocument();
    });
  });

  describe('Layout Integration', () => {
    test('passes correct props to LayoutWithRBAC', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            title='Custom Title'
            subtitle='Custom Subtitle'
            layoutProps={{ customProp: 'test' }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const layoutProps = JSON.parse(
        screen.getByTestId('layout-with-rbac').getAttribute('data-props')
      );

      expect(layoutProps.title).toBe('Custom Title');
      expect(layoutProps.subtitle).toBe('Custom Subtitle');
      expect(layoutProps.permission).toBe('accounting.view');
      expect(layoutProps.editPermission).toBe('accounting.edit');
      expect(layoutProps.documentId).toBe('TEST-001');
      expect(layoutProps.documentType).toBe('invoice');
      expect(layoutProps.customProp).toBe('test');
    });

    test('generates default title from status', () => {
      render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'review' }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const layoutProps = JSON.parse(
        screen.getByTestId('layout-with-rbac').getAttribute('data-props')
      );

      expect(layoutProps.title).toBe('จัดการรอตรวจสอบ');
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { rerender } = render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const initialChildProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Rerender with same props
      rerender(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId='TEST-001'
            documentType='invoice'
            documentData={{ status: 'draft', currentStep: 0 }}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      const newChildProps = JSON.parse(
        screen.getByTestId('child-component').getAttribute('data-props')
      );

      // Functions should be stable (memoized)
      expect(initialChildProps.onStatusChange).toBe(
        newChildProps.onStatusChange
      );
      expect(initialChildProps.onStepChange).toBe(newChildProps.onStepChange);
    });
  });
});

describe('DocumentWorkflowWrapper Integration Scenarios', () => {
  test('works with complex document data', () => {
    const complexDocumentData = {
      id: 'COMPLEX-001',
      status: 'review',
      currentStep: 1,
      metadata: {
        createdBy: 'user123',
        createdAt: Date.now(),
        department: 'accounting',
        branch: '0450',
      },
      items: [
        { id: 1, name: 'Item 1', quantity: 2, price: 1000 },
        { id: 2, name: 'Item 2', quantity: 1, price: 500 },
      ],
      totals: {
        subtotal: 2500,
        tax: 175,
        total: 2675,
      },
    };

    render(
      <TestWrapper>
        <DocumentWorkflowWrapper
          documentId='COMPLEX-001'
          documentType='invoice'
          documentData={complexDocumentData}
        >
          <MockChildComponent />
        </DocumentWorkflowWrapper>
      </TestWrapper>
    );

    const childProps = JSON.parse(
      screen.getByTestId('child-component').getAttribute('data-props')
    );

    expect(childProps.documentData).toEqual(complexDocumentData);
    expect(childProps.currentStatus).toBe('review');
    expect(childProps.currentStep).toBe(1);
  });

  test('handles multiple document types', () => {
    const documentTypes = [
      'invoice',
      'sales_order',
      'service_order',
      'inventory_import',
    ];

    documentTypes.forEach((docType) => {
      const { unmount } = render(
        <TestWrapper>
          <DocumentWorkflowWrapper
            documentId={`${docType.toUpperCase()}-001`}
            documentType={docType}
          >
            <MockChildComponent />
          </DocumentWorkflowWrapper>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-with-rbac')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toBeInTheDocument();

      unmount();
    });
  });
});
