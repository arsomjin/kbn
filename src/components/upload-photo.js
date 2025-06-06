import React, { useContext, useEffect, useState } from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { FirebaseContext } from '../firebase';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('Upload ได้เฉพาะไฟล์ JPG/PNG!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('รูปภาพต้องมีขนาดน้อยกว่า 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

const UploadPhoto = ({ fileName, folder, onUploaded, url }) => {
  const { storage } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(url);

  useEffect(() => {
    setImageUrl(url);
  }, [url]);

  const handleChange = info => {
    //  showLog('info', info);
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imgUrl => {
        //  showLog('imgUrl', imgUrl);
        setLoading(false);
        setImageUrl(imgUrl);
        onUploaded(imgUrl);
      });
    }
  };

  const customUpload = async ({ onError, onSuccess, file }) => {
    const metadata = {
      contentType: 'image/jpeg'
    };

    const imageName = fileName || `image-${Date.now()}`; //a unique name for the image
    const imgFile = storage.ref(`${folder || ''}/images/${imageName}.png`);
    try {
      const image = await imgFile.put(file, metadata);
      const url = await imgFile.getDownloadURL();
      //  showLog('url', url);
      setImageUrl(url);
      setLoading(false);
      //   onSuccess(null, image);
    } catch (e) {
      onError(e);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>อัปโหลด</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={customUpload}
    >
      {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
    </Upload>
  );
};

export default UploadPhoto;
