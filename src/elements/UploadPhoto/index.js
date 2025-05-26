import { FirebaseContext } from '../../firebase';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './styles';
import { showWarn } from 'functions';
import { Progress } from 'shards-react';
import { PopOver } from 'elements';
import { Skeleton } from 'antd';
// import './styles.css';
const UploadFiles = ({
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
  ...props
}) => {
  const { theme } = useSelector(state => state.global);
  const [profileImg, setProfileImg] = useState(src || noImage || require('images/avatars/blank-profile.png'));
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const { storage } = useContext(FirebaseContext);

  const imageHandler = e => {
    //  showLog('image', e.target.files[0]);
    //  showLog('imageName', e.target.files[0].name);
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
              setProfileImg(url);
              setUrl && setUrl(url);
            });
        }
      );
    }
  };

  // showLog('uploadProps', props);

  return (
    <div className="text-center" style={style}>
      {/* <h4>Add your Image</h4> */}
      <div className="mb-3 mx-auto">
        {loading ? (
          <div style={{ height: 110, overflow: 'hidden' }}>
            <Skeleton active />
          </div>
        ) : (
          <img
            src={profileImg}
            alt=""
            id="img"
            className={className || 'rounded-circle'}
            // width={110}
            // height={110}
            style={
              imageStyle || {
                objectFit: 'cover',
                width: 110,
                height: 110
              }
            }
          />
        )}
      </div>
      {progress > 0 && progress < 99 && <Progress value={progress} animated />}
      <input
        type="file"
        // accept="image/*"
        accept=".jpg,.png,.jpeg"
        name="image-upload"
        id="input"
        onChange={imageHandler}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <div style={styles.label}>
        <label
          style={{
            ...styles.imageUpload,
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.grey5
          }}
          htmlFor="input"
        >
          <i className="material-icons" style={styles.icon}>
            add_photo_alternate
          </i>
          {title || 'อัปโหลดรูป'}
        </label>
      </div>
      <PopOver
        title={popTitle || 'ขนาดรูปภาพ 300x300'}
        detail={popDetail || 'รูปภาพควรเป็นรูปสี่เหลี่ยมจตุรัส ขนาด 300x300 px'}
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

export default UploadFiles;
