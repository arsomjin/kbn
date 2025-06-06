import React from 'react';
import { Card, CardBody } from 'shards-react';
import ReactQuill from 'react-quill';
import { TextInput } from 'elements';
import 'react-quill/dist/quill.snow.css';
import { Typography } from 'antd';
import { styles } from 'styles';
import { formatsQuill, modulesQuill } from './api';

const Editor = ({ title, body, onTitleChange, onBodyChange, titleError, bodyError }) => {
  const _onTitleChange = e => {
    onTitleChange && onTitleChange(e.target.value);
  };
  const _onBodyChange = value => {
    onBodyChange && onBodyChange(value);
  };

  return (
    <Card small className="mb-3">
      <CardBody>
        <TextInput
          onChange={_onTitleChange}
          value={title || ''}
          size="lg"
          className="mb-3"
          placeholder="หัวข้อการแจ้งเตือน (Your Notification Title)"
          error={titleError}
        />
        <ReactQuill
          modules={modulesQuill}
          formats={formatsQuill}
          onChange={_onBodyChange}
          value={body || ''}
          className="add-new-post__editor mb-1"
        />
        {!!bodyError && (
          <Typography component="p" style={styles.errorTxt}>
            {bodyError}
          </Typography>
        )}
      </CardBody>
    </Card>
  );
};

export default Editor;
