import { FirebaseContext } from '../../firebase';
import { showLog } from 'functions';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FileMetaData, FileUploadContainer, ImagePreview, RemoveFileIcon } from './styles';
import { showWarn } from 'functions';
import { Progress } from 'shards-react';
import { Modal, Popconfirm, Spin } from 'antd';
import { showMessageBar } from 'functions';

const RenderImage = ({ url, className, hasValue, resizeMode, width, height }) => (
  <ImagePreview
    src={url}
    className={className || 'rounded-circle'}
    style={
      !!hasValue
        ? {
            objectFit: resizeMode || 'cover',
            width: width || 110,
            height: height || 110
          }
        : {
            objectFit: resizeMode || 'contain',
            width: 40,
            height: 40
          }
    }
  />
);

export default forwardRef(
  ({ value, onChange, storeRef, resizeMode, width, height, title, className, disabled, readOnly, ...props }, ref) => {
    const { theme } = useSelector(state => state.global);
    const [imgURL, setImg] = useState(value || require('images/plus-sign.png'));
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const { storage } = useContext(FirebaseContext);

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
        }
      }),
      []
    );

    useEffect(() => {
      // showLog({ image_update: value });
      setImg(value || require('images/plus-sign.png'));
    }, [value]);

    const imageHandler = e => {
      if (e.target.files[0]) {
        setProgress(0);
        setLoading(true);
        const image = e.target.files[0];
        let storageRef = storeRef || 'images';
        let imageName = image.name || `img${Date.now()}.png`;
        const uploadTask = storage.ref(`${storageRef}/${imageName}`).put(image);
        uploadTask.on(
          'state_changed',
          snapshot => {
            // progrss function ....
            const mProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            // showLog('Upload is ' + mProgress + '% done');
            setProgress(mProgress);
          },
          error => {
            // error function ....
            showWarn(error);
            setLoading(false);
          },
          () => {
            // complete function ....
            storage
              .ref(`${storageRef}/${imageName}`)
              .getDownloadURL()
              .then(url => {
                //  showLog(url);
                setLoading(false);
                setImg(url);
                onChange && onChange(url);
              });
          }
        );
      }
    };

    const handleUploadBtnClick = () => {
      if (!!readOnly || !!disabled) {
        !value && showMessageBar(` ${!!readOnly ? 'อ่านอย่างเดียว' : 'ไม่สามารถแก้ไขได้'}`, null, 'warning');
        return;
      }
      !value && imageRef.current.click();
    };

    const _remove = () => {
      if (!!readOnly || !!disabled) {
        return showMessageBar(` ${!!readOnly ? 'อ่านอย่างเดียว' : 'ไม่สามารถแก้ไขได้'}`, null, 'warning');
      }
      onChange && onChange(null);
    };

    const _preview = () => {
      setVisible(true);
    };
    // showLog('uploadProps', props);

    const imgProps = {
      url: imgURL,
      className: className,
      hasValue: value,
      resizeMode: resizeMode,
      width: width,
      height: height
    };

    return (
      <div style={{ display: 'inline-block' }} className="text-center">
        {title && <label className="text-primary">{title}</label>}
        <FileUploadContainer
          onClick={handleUploadBtnClick}
          style={{
            width: width || 110,
            height: height || 110,
            ...(!className && { borderRadius: (width || 110) / 2 })
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
          {progress > 0 && progress < 99 && <Progress value={progress} animated />}
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
              ...(!className && { borderRadius: (width || 110) / 2 })
            }}
          >
            <aside>
              <RemoveFileIcon className="fas fa-eye mx-3" onClick={_preview} />
              {!(!!readOnly || !!disabled) && (
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
  }
);
