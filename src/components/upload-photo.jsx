import React, { useEffect, useState } from 'react';
import { Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useModal } from 'contexts/ModalContext';
import { useAuth } from 'hooks/useAuth';
import { useResponsive } from 'hooks/useResponsive';
import { app } from 'config/firebase';

/**
 * Convert file to base64 string
 * @param {File} img - Image file
 * @param {Function} callback - Callback function
 */
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Function} showError - Error display function
 * @param {Function} t - Translation function
 * @returns {boolean} Validation result
 */
const beforeUpload = (file, showError, t) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    showError(t('upload.errors.invalidFileType'));
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    showError(t('upload.errors.fileTooLarge'));
    return false;
  }

  return isJpgOrPng && isLt2M;
};

/**
 * Photo Upload Component
 * Provides image upload functionality with Firebase Storage integration
 * @param {Object} props - Component props
 * @param {string} props.fileName - Custom file name
 * @param {string} props.folder - Storage folder path
 * @param {Function} props.onUploaded - Upload success callback
 * @param {string} props.url - Current image URL
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const UploadPhoto = ({ fileName, folder, onUploaded, url, className, style, ...props }) => {
  const { t } = useTranslation('components');
  const { showError, showSuccess } = useModal();
  const { currentUser, currentProvinceId } = useAuth();
  const { isMobile } = useResponsive();

  const storage = getStorage(app);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(url);

  useEffect(() => {
    setImageUrl(url);
  }, [url]);

  /**
   * Handle upload status change
   * @param {Object} info - Upload info object
   */
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      // Get base64 for immediate preview
      getBase64(info.file.originFileObj, (imgUrl) => {
        setLoading(false);
        setImageUrl(imgUrl);
        onUploaded?.(imgUrl);
      });
    }

    if (info.file.status === 'error') {
      setLoading(false);
      showError(t('upload.errors.uploadFailed'));
    }
  };

  /**
   * Custom upload implementation using Firebase Storage
   * @param {Object} uploadProps - Upload properties
   * @param {Function} uploadProps.onError - Error callback
   * @param {Function} uploadProps.onSuccess - Success callback
   * @param {File} uploadProps.file - File to upload
   */
  const customUpload = async ({ onError, onSuccess, file }) => {
    try {
      setLoading(true);

      // Generate unique filename with province context
      const timestamp = Date.now();
      const imageName = fileName || `image-${currentProvinceId}-${timestamp}`;
      const folderPath = folder || 'uploads';

      // Create storage reference
      const imageRef = ref(storage, `${folderPath}/images/${imageName}.${file.type.split('/')[1]}`);

      // Upload file
      const snapshot = await uploadBytes(imageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: currentUser?.uid || 'anonymous',
          provinceId: currentProvinceId || 'default',
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      setImageUrl(downloadURL);
      setLoading(false);

      // Call success callbacks
      onSuccess?.(snapshot);
      onUploaded?.(downloadURL);
      showSuccess(t('upload.success.uploaded'));
    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
      onError?.(error);
      showError(t('upload.errors.uploadFailed'));
    }
  };

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {boolean} Validation result
   */
  const handleBeforeUpload = (file) => {
    return beforeUpload(file, showError, t);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4">
      {loading ? (
        <LoadingOutlined className="text-2xl text-gray-400" />
      ) : (
        <PlusOutlined className="text-2xl text-gray-400" />
      )}
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('upload.button.text')}</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className={`avatar-uploader ${className || ''}`}
      style={{
        width: isMobile ? '100px' : '120px',
        height: isMobile ? '100px' : '120px',
        ...style,
      }}
      showUploadList={false}
      beforeUpload={handleBeforeUpload}
      onChange={handleChange}
      customRequest={customUpload}
      {...props}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={t('upload.alt.preview')}
          className="w-full h-full object-cover rounded"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};

export default UploadPhoto;
