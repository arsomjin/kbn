import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// import styles from './styles';
import { showWarn } from 'utils/functions';
import { Progress, Skeleton, Popover, Button } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import blankProfile from 'assets/images/blank-profile.png';
// import './styles.css';

/**
 * UploadPhoto component for uploading and displaying a profile image.
 * Enhanced to match modern UI and snapshot.
 * @param {object} props
 * @param {string} src - Image URL
 * @param {string} storeRef - Firebase Storage reference path
 * @param {function} setUrl - Callback to set uploaded image URL
 * @param {string} title - Upload button label
 * @param {string} popTitle - Popover title
 * @param {string} popDetail - Popover content
 * @param {object} style - Custom style for container
 * @param {boolean} disabled - Disable upload
 * @param {string} noImage - Fallback image URL
 * @param {string} className - Custom class for image
 * @param {object} imageStyle - Custom style for image
 */
const UploadPhoto = ({
  src,
  storeRef,
  setUrl,
  title,
  popTitle,
  popDetail,
  style,
  disabled,
  noImage,
  className,
  imageStyle,
}) => {
  const { t } = useTranslation();
  const [profileImg, setProfileImg] = useState(src || noImage || blankProfile);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const storage = getStorage();
  const inputRef = useRef();

  // Handle image upload
  const imageHandler = (e) => {
    if (e.target.files[0]) {
      setProgress(0);
      setLoading(true);
      const image = e.target.files[0];
      let storageRefPath = storeRef || 'images';
      let imageName = image.name || `img${Date.now()}.png`;
      const storageReference = ref(storage, `${storageRefPath}/${imageName}`);
      const uploadTask = uploadBytesResumable(storageReference, image);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const mProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(mProgress);
        },
        (error) => {
          showWarn(error);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setLoading(false);
            setProfileImg(url);
            setUrl && setUrl(url);
          });
        },
      );
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  // Popover content for image requirements
  const popoverContent =
    popDetail || t('uploadPhoto.popDetail', 'รูปภาพควรเป็นรูปสี่เหลี่ยมจตุรัส ขนาด 300x300 px');
  const popoverTitle = popTitle || t('uploadPhoto.popTitle', 'ขนาดรูปภาพ 300x300');

  return (
    <div
      className="flex flex-col items-center justify-center relative w-full"
      style={{ ...style, minWidth: 180 }}
    >
      <div className="relative mb-4" style={{ width: 120, height: 120 }}>
        {/* Profile Image with absolute popover icon */}
        <img
          src={profileImg}
          alt={t('uploadPhoto.alt', 'Profile photo')}
          className={
            className || 'rounded-full border border-gray-200 shadow-sm object-cover bg-white'
          }
          style={{
            width: 120,
            height: 120,
            objectFit: 'cover',
            display: 'block',
            margin: '0 auto',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...imageStyle,
          }}
          onClick={triggerFileInput}
          tabIndex={disabled ? -1 : 0}
          aria-label={t('uploadPhoto.alt', 'Profile photo')}
          role="button"
          onKeyPress={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) triggerFileInput();
          }}
        />
        {/* Popover icon at top-right */}
        <Popover content={popoverContent} title={popoverTitle} trigger="hover" placement="topRight">
          <QuestionCircleOutlined
            style={{
              position: 'absolute',
              bottom: -4,
              right: -20,
              fontSize: 20,
              color: '#bdbdbd',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              zIndex: 2,
            }}
            aria-label={t('uploadPhoto.info', 'Image requirements')}
          />
        </Popover>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
            <Skeleton.Avatar active size={120} shape="circle" />
          </div>
        )}
      </div>
      {/* Progress bar only when uploading */}
      {progress > 0 && progress < 99 && (
        <div className="w-32 mb-2">
          <Progress percent={progress} status="active" showInfo={false} strokeWidth={8} />
        </div>
      )}
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.png,.jpeg"
        name="image-upload"
        id="input-upload-photo"
        onChange={imageHandler}
        disabled={disabled}
        style={{ display: 'none' }}
        aria-label={t('uploadPhoto.inputLabel', 'Upload profile photo')}
      />
      {/* Upload button */}
      <label htmlFor="input-upload-photo" className="w-full">
        <Button
          icon={<PlusOutlined />}
          disabled={disabled}
          block
          ghost
          shape="round"
          size="large"
          style={{
            background: '#f5f5f5',
            color: '#757575',
            border: 'none',
            fontWeight: 500,
            marginBottom: 16,
            marginTop: 0,
            width: '100%',
            height: 40,
            letterSpacing: 0.5,
          }}
          onClick={(e) => {
            e.preventDefault();
            triggerFileInput();
          }}
        >
          {title || t('uploadPhoto.button', 'อัปโหลดรูป')}
        </Button>
      </label>
    </div>
  );
};

export default UploadPhoto;
