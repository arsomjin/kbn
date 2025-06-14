import React from 'react';
import { 
  SendOutlined, 
  ReloadOutlined, 
  LogoutOutlined, 
  SaveOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import CustomButton from './Button';

/**
 * CustomButton Usage Examples
 * Demonstrates all variants, sizes, and use cases
 */

export const ButtonExamples = () => {
  return (
    <div style={{ padding: '24px', background: '#f5f5f5' }}>
      <h2>🎨 Enhanced CustomButton Examples</h2>
      
      {/* Size Variants */}
      <section style={{ marginBottom: '32px' }}>
        <h3>📏 Size Variants</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <CustomButton size="small">Small Button</CustomButton>
          <CustomButton size="medium">Medium Button</CustomButton>
          <CustomButton size="large">Large Button</CustomButton>
          <CustomButton size="xlarge">XLarge Button</CustomButton>
        </div>
      </section>

      {/* Style Variants */}
      <section style={{ marginBottom: '32px' }}>
        <h3>🎨 Style Variants</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CustomButton variant="primary">Primary</CustomButton>
          <CustomButton variant="secondary">Secondary</CustomButton>
          <CustomButton variant="success">Success</CustomButton>
          <CustomButton variant="warning">Warning</CustomButton>
          <CustomButton variant="danger">Danger</CustomButton>
          <CustomButton variant="ghost">Ghost</CustomButton>
          <CustomButton variant="text">Text</CustomButton>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '32px' }}>
        <h3>🔥 With Icons</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CustomButton variant="primary" icon={<SendOutlined />}>
            Send Application
          </CustomButton>
          <CustomButton variant="warning" icon={<ReloadOutlined />}>
            Check Status
          </CustomButton>
          <CustomButton variant="secondary" icon={<LogoutOutlined />}>
            Logout
          </CustomButton>
          <CustomButton variant="success" icon={<SaveOutlined />}>
            Save Changes
          </CustomButton>
          <CustomButton variant="danger" icon={<DeleteOutlined />}>
            Delete Item
          </CustomButton>
        </div>
      </section>

      {/* States */}
      <section style={{ marginBottom: '32px' }}>
        <h3>⚡ Button States</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CustomButton variant="primary">Normal</CustomButton>
          <CustomButton variant="primary" loading>Loading</CustomButton>
          <CustomButton variant="primary" disabled>Disabled</CustomButton>
          <CustomButton variant="primary" block>Block Button</CustomButton>
        </div>
      </section>

      {/* Real-world Examples */}
      <section style={{ marginBottom: '32px' }}>
        <h3>🚀 Real-world Examples</h3>
        
        {/* Reapplication Form Buttons */}
        <div style={{ marginBottom: '16px' }}>
          <h4>Reapplication Form Actions</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <CustomButton 
              variant="primary" 
              size="large" 
              icon={<SendOutlined />}
              onClick={() => console.log('Send reapplication')}
            >
              ส่งคำขออนุมัติใหม่
            </CustomButton>
            <CustomButton 
              variant="warning" 
              size="large" 
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              ตรวจสอบสถานะ
            </CustomButton>
            <CustomButton 
              variant="secondary" 
              size="large" 
              icon={<LogoutOutlined />}
              onClick={() => console.log('Logout')}
            >
              กลับสู่หน้าเข้าสู่ระบบ
            </CustomButton>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ marginBottom: '16px' }}>
          <h4>Form Actions</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <CustomButton 
              variant="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              Save
            </CustomButton>
            <CustomButton 
              variant="ghost" 
              htmlType="button"
            >
              Cancel
            </CustomButton>
            <CustomButton 
              variant="text" 
              htmlType="reset"
            >
              Reset
            </CustomButton>
          </div>
        </div>

        {/* CRUD Operations */}
        <div style={{ marginBottom: '16px' }}>
          <h4>CRUD Operations</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <CustomButton 
              variant="success" 
              size="small"
              icon={<PlusOutlined />}
            >
              Create
            </CustomButton>
            <CustomButton 
              variant="primary" 
              size="small"
              icon={<EditOutlined />}
            >
              Edit
            </CustomButton>
            <CustomButton 
              variant="secondary" 
              size="small"
              icon={<DownloadOutlined />}
            >
              Export
            </CustomButton>
            <CustomButton 
              variant="danger" 
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </CustomButton>
          </div>
        </div>
      </section>

      {/* Custom Styling */}
      <section style={{ marginBottom: '32px' }}>
        <h3>🎯 Custom Styling</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <CustomButton 
            variant="primary"
            style={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Custom Gradient
          </CustomButton>
          <CustomButton 
            variant="ghost"
            style={{ 
              borderColor: '#52c41a',
              color: '#52c41a',
              borderWidth: '2px'
            }}
          >
            Custom Border
          </CustomButton>
          <CustomButton 
            variant="text"
            style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#722ed1'
            }}
          >
            Custom Text
          </CustomButton>
        </div>
      </section>
    </div>
  );
};

// Usage in ApprovalStatus.js
export const ReapplicationButtons = () => {
  return (
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <CustomButton 
        variant="primary" 
        size="large" 
        icon={<SendOutlined />}
        onClick={() => console.log('Open reapplication form')}
        style={{ minWidth: '200px' }}
      >
        ส่งคำขออนุมัติใหม่
      </CustomButton>
      
      <CustomButton 
        variant="warning" 
        size="large" 
        icon={<ReloadOutlined />}
        onClick={() => window.location.reload()}
        style={{ minWidth: '180px' }}
      >
        ตรวจสอบสถานะ
      </CustomButton>
      
      <CustomButton 
        variant="secondary" 
        size="large" 
        icon={<LogoutOutlined />}
        onClick={() => console.log('Handle logout')}
        style={{ minWidth: '200px' }}
      >
        กลับสู่หน้าเข้าสู่ระบบ
      </CustomButton>
    </div>
  );
};

export default ButtonExamples; 