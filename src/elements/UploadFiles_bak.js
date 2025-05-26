import React, { useState, useEffect } from 'react';
import { getFiles, uploadFile } from 'api';
import { Button, Modal } from '@material-ui/core';
import { ModalBody, ModalFooter, ModalHeader } from 'shards-react';
import { styles } from 'styles';

const UploadFiles = props => {
  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [currentFile, setCurrentFile] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => {
    getFiles().then(response => {
      setFileInfos(response.data);
    });
  }, []);

  const selectFile = event => {
    setSelectedFiles(event.target.files);
  };

  const upload = () => {
    let currentFile = selectedFiles[0];

    setProgress(0);
    setCurrentFile(currentFile);

    uploadFile(currentFile, event => {
      setProgress(Math.round((100 * event.loaded) / event.total));
    })
      .then(response => {
        setMessage(response.data.message);
        return getFiles();
      })
      .then(files => {
        setFileInfos(files.data);
      })
      .catch(() => {
        setProgress(0);
        setMessage('Could not upload the file!');
        setCurrentFile(undefined);
      });

    setSelectedFiles(undefined);
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.centered,
          backgroundColor: '#fff'
        }}
      >
        {currentFile && (
          <div className="progress">
            <div
              className="progress-bar progress-bar-info progress-bar-striped"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: progress + '%' }}
            >
              {progress}%
            </div>
          </div>
        )}

        <label className="btn btn-default">
          <input type="file" onChange={selectFile} />
        </label>

        <button className="btn btn-success" disabled={!selectedFiles} onClick={upload}>
          Upload
        </button>

        <div className="alert alert-light" role="alert">
          {message}
        </div>

        <div className="card">
          <div className="card-header">List of Files</div>
          <ul className="list-group list-group-flush">
            {fileInfos &&
              fileInfos.map((file, index) => (
                <li className="list-group-item" key={index}>
                  <a href={file.url}>{file.name}</a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Modal open backdrop toggle={() => {}}>
      <ModalHeader>
        <img src={require('images/green-tick.gif')} alt="Success" width="40" height="40" style={{ marginRight: 10 }} />{' '}
        {props.title || 'File Upload'}
      </ModalHeader>
      <ModalBody>Content</ModalBody>
      <ModalFooter>
        <Button outline>ตกลง</Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadFiles;
