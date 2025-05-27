import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import { showLog } from 'utils/functions';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FileMetaData, FileUploadContainer, ImagePreview, RemoveFileIcon } from './styles';
import { showWarn } from 'utils/functions';
import { Modal, Popconfirm, Spin, Progress } from 'antd';
import { showMessageBar } from 'utils/functions';
import plusSign from '../../images/plus-sign.png';

const RenderImage = ({ url, className, hasValue, resizeMode, width, height }) => (
  <ImagePreview
    src={url}
    className={className || 'rounded-circle'}
    style={
      hasValue
        ? {
            objectFit: resizeMode || 'cover',
            width: width || 110,
            height: height || 110,
          }
        : {
            objectFit: resizeMode || 'contain',
            width: 40,
            height: 40,
          }
    }
  />
);

const UploadImage = forwardRef(
  (
    { value, onChange, storeRef, resizeMode, width, height, title, className, disabled, readOnly },
    ref,
  ) => {
    const [imgURL, setImg] = useState(value || plusSign);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const storage = getStorage();
    const imageRef = useRef();

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          imageRef.current.focus();
        },
        blur: () => {
          imageRef.current.blur();
        },
        clear: () => {
          imageRef.current.clear();
        },
        isFocused: () => {
          return imageRef.current.isFocused();
        },
        setNativeProps(nativeProps) {
          imageRef.current.setNativeProps(nativeProps);
        },
      }),
      [],
    );

    useEffect(() => {
      setImg(value || plusSign);
    }, [value]);

    const imageHandler = (e) => {
      if (e.target.files[0]) {
        setProgress(0);
        setLoading(true);
        const image = e.target.files[0];
        let storagePath = storeRef || 'images';
        let imageName = image.name || `img${Date.now()}.png`;
        const storageRef = ref(storage, `${storagePath}/${imageName}`);

        uploadBytes(storageRef, image)
          .then((snapshot) => {
            const mProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(mProgress);

            return getDownloadURL(snapshot.ref);
          })
          .then((url) => {
            setLoading(false);
            setImg(url);
            onChange && onChange(url);
          })
          .catch((error) => {
            showWarn(error);
            setLoading(false);
          });
      }
    };

    const handleUploadBtnClick = () => {
      if (readOnly || disabled) {
        !value &&
          showMessageBar(` ${readOnly ? 'อ่านอย่างเดียว' : 'ไม่สามารถแก้ไขได้'}`, null, 'warning');
        return;
      }
      !value && imageRef.current.click();
    };

    const _remove = () => {
      if (readOnly || disabled) {
        return showMessageBar(
          ` ${readOnly ? 'อ่านอย่างเดียว' : 'ไม่สามารถแก้ไขได้'}`,
          null,
          'warning',
        );
      }
      onChange && onChange(null);
    };

    const _preview = () => {
      setVisible(true);
    };

    const imgProps = {
      url: imgURL,
      className: className,
      hasValue: value,
      resizeMode: resizeMode,
      width: width,
      height: height,
    };

    return (
      <div style={{ display: 'inline-block' }} className="text-center">
        {title && <label className="text-primary">{title}</label>}
        <FileUploadContainer
          onClick={handleUploadBtnClick}
          style={{
            width: width || 110,
            height: height || 110,
            ...(!className && { borderRadius: (width || 110) / 2 }),
          }}
          isImageFile={!!value}
        >
          {loading ? (
            <Spin>
              <RenderImage {...imgProps} />
            </Spin>
          ) : (
            <RenderImage {...imgProps} />
          )}
          {progress > 0 && progress < 99 && <Progress percent={progress} status="active" />}
          <input
            ref={imageRef}
            type="file"
            accept=".jpg,.png,.jpeg"
            name="image-upload"
            id="input"
            onChange={imageHandler}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          <FileMetaData
            isImageFile={!!value}
            style={{
              ...(!className && { borderRadius: (width || 110) / 2 }),
            }}
          >
            <aside>
              <RemoveFileIcon className="fas fa-eye mx-3" onClick={_preview} />
              {!(readOnly || disabled) && (
                <Popconfirm
                  title="ลบรูป ?"
                  onConfirm={_remove}
                  onCancel={() => showLog('cancel')}
                  okText="ยืนยัน"
                  cancelText="ยกเลิก"
                >
                  <RemoveFileIcon className="fas fa-trash-alt mx-3" />
                </Popconfirm>
              )}
            </aside>
          </FileMetaData>
        </FileUploadContainer>
        <Modal visible={visible && !!imgURL} footer={null} onCancel={() => setVisible(false)}>
          <img alt="preview" style={{ width: '100%' }} src={imgURL} />
        </Modal>
      </div>
    );
  },
);

export default UploadImage;
