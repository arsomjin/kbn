import React from 'react';
import { Card, Form, Input, Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageDoc from '../../components/PageDoc';

const ProvinceSettings: React.FC = () => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div>
      <PageDoc />
      <h1>{t('settings:province.title')}</h1>
      <Card>
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Form.Item
            name='name'
            label={t('settings:province.name')}
            rules={[{ required: true, message: t('settings:province.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='code'
            label={t('settings:province.code')}
            rules={[{ required: true, message: t('settings:province.codeRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              {t('common:save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProvinceSettings;
