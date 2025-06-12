import { FirebaseContext } from '../../firebase';
import React, { useContext, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './styles';
import { showWarn } from 'functions';
import { Progress } from 'shards-react';
import { PopOver } from 'elements';
import { Skeleton } from 'antd';
// import './styles.css';

// Constants
const DEFAULT_IMAGE_SIZE = 110;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const PROGRESS_COMPLETE_THRESHOLD = 99;

/**
 * UploadPhoto Component
 * A reusable component for uploading and displaying photos with Firebase Storage
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Initial image source URL
 * @param {string} props.storeRef - Firebase storage reference path
 * @param {Function} props.setUrl - Callback function called with uploaded image URL
 * @param {string} props.title - Upload button title text
 * @param {string} props.popTitle - Popover title text
 * @param {string} props.popDetail - Popover detail text
 * @param {Object} props.style - Container style object
 * @param {boolean} props.disabled - Whether upload is disabled
 * @param {string} props.noImage - Fallback image URL when no image is provided
 * @param {string} props.className - CSS class for the image element
 * @param {Object} props.imageStyle - Style object for the image element
 */
const UploadPhoto = ({
  src,
  storeRef = 'images',
  setUrl,
  title = 'อัปโหลดรูป',
  popTitle = 'ขนาดรูปภาพ 300x300',
  popDetail = 'รูปภาพควรเป็นรูปสี่เหลี่ยมจตุรัส ขนาด 300x300 px',
  style,
  disabled = false,
  noImage,
  className = 'rounded-circle',
  imageStyle,
  maxFileSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_FILE_TYPES,
  imageSize = DEFAULT_IMAGE_SIZE,
  ...props
}) => {
  const { theme } = useSelector(state => state.global);
  const defaultImage = noImage || require('images/avatars/blank-profile.png');
  
  const [profileImg, setProfileImg] = useState(src || defaultImage);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { storage } = useContext(FirebaseContext);

  /**
   * Validates the selected file
   * @param {File} file - The file to validate
   * @returns {string|null} Error message or null if valid
   */
  const validateFile = useCallback((file) => {
    if (!file) return 'ไม่พบไฟล์';
    
    if (file.size > maxFileSize) {
      return `ขนาดไฟล์ใหญ่เกินไป (สูงสุด ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB)`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ JPG, JPEG, PNG)';
    }
    
    return null;
  }, [maxFileSize, allowedTypes]);

  /**
   * Handles file selection and upload
   * @param {Event} e - File input change event
   */
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      showWarn(validationError);
      // Reset file input
      e.target.value = '';
      return;
    }

    setProgress(0);
    setLoading(true);

    try {
      const imageName = file.name || `img_${Date.now()}.png`;
      const uploadTask = storage.ref(`${storeRef}/${imageName}`).put(file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const uploadProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(uploadProgress);
        },
        (error) => {
          // Upload error handling
          const errorMessage = 'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
          setError(errorMessage);
          showWarn(errorMessage);
          setLoading(false);
          setProgress(0);
          // Reset file input
          e.target.value = '';
        },
        async () => {
          // Upload completion
          try {
            const downloadURL = await storage
              .ref(`${storeRef}/${imageName}`)
              .getDownloadURL();
            
            setLoading(false);
            setProgress(0);
            setProfileImg(downloadURL);
            setUrl && setUrl(downloadURL);
            
            // Reset file input for future uploads
            e.target.value = '';
          } catch (error) {
            const errorMessage = 'ไม่สามารถรับ URL ของรูปภาพได้';
            setError(errorMessage);
            showWarn(errorMessage);
            setLoading(false);
            setProgress(0);
            e.target.value = '';
          }
        }
      );
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลด';
      setError(errorMessage);
      showWarn(errorMessage);
      setLoading(false);
      setProgress(0);
      e.target.value = '';
    }
  }, [storage, storeRef, setUrl, validateFile]);

  const defaultImageStyle = {
    objectFit: 'cover',
    width: imageSize,
    height: imageSize
  };

  return (
    <div className="text-center" style={style} {...props}>
      <div className="mb-3 mx-auto">
        {loading ? (
          <div style={{ height: imageSize, width: imageSize, overflow: 'hidden', margin: '0 auto' }}>
            <Skeleton.Image 
              active 
              style={{ width: imageSize, height: imageSize }}
            />
          </div>
        ) : (
          <img
            src={profileImg}
            alt="อัปโหลดรูปภาพ"
            id="uploaded-image"
            className={className}
            style={imageStyle || defaultImageStyle}
            onError={() => setProfileImg(defaultImage)}
          />
        )}
      </div>

      {/* Progress bar */}
      {progress > 0 && progress < PROGRESS_COMPLETE_THRESHOLD && (
        <div className="mb-2">
          <Progress value={progress} animated striped />
          <small className="text-muted">{progress}% เสร็จสิ้น</small>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-danger alert-sm mb-2" role="alert">
          <small>{error}</small>
        </div>
      )}

      {/* File input */}
      <input
        type="file"
        accept=".jpg,.png,.jpeg"
        name="image-upload"
        id="image-upload-input"
        onChange={handleImageUpload}
        disabled={disabled || loading}
        style={{ display: 'none' }}
        aria-label="เลือกไฟล์รูปภาพ"
      />

      {/* Upload button */}
      <div style={styles.label}>
        <label
          style={{
            ...styles.imageUpload,
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.grey5,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            opacity: disabled || loading ? 0.6 : 1
          }}
          htmlFor="image-upload-input"
          role="button"
          aria-label={`${title} - คลิกเพื่อเลือกไฟล์`}
        >
          <i 
            className="material-icons" 
            style={styles.icon}
            aria-hidden="true"
          >
            {loading ? 'hourglass_empty' : 'add_photo_alternate'}
          </i>
          {loading ? 'กำลังอัปโหลด...' : title}
        </label>
      </div>

      {/* Info popover */}
      <PopOver
        title={popTitle}
        detail={popDetail}
        style={{
          position: 'absolute',
          left: '65%',
          width: 40,
          height: 40,
          top: '5%'
        }}
      />
    </div>
  );
};

// PropTypes validation
UploadPhoto.propTypes = {
  src: PropTypes.string,
  storeRef: PropTypes.string,
  setUrl: PropTypes.func,
  title: PropTypes.string,
  popTitle: PropTypes.string,
  popDetail: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  noImage: PropTypes.string,
  className: PropTypes.string,
  imageStyle: PropTypes.object,
  maxFileSize: PropTypes.number,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  imageSize: PropTypes.number
};

export default UploadPhoto;
