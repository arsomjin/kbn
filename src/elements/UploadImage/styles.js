import styled from 'styled-components';

export default {
  label: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center'
  },
  imageUpload: {
    margin: 'auto',
    width: '140px',
    height: '32px',
    borderRadius: '10px',
    paddingTop: '4px',
    textAlign: 'center',
    alignItems: 'center'
  },
  decalUpload: {
    margin: 'auto',
    width: '140px',
    height: '32px',
    borderRadius: '10px',
    paddingTop: '4px',
    textAlign: 'center',
    alignItems: 'center'
  },
  icon: { marginRight: '5px', fontSize: '16px', marginTop: '2px' }
};

export const FileMetaData = styled.div`
  display: ${props => (!props.isImageFile ? 'none' : 'flex')};
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  background-color: rgba(5, 5, 5, 0.55);
  opacity: 0;

  aside {
    margin: auto;
    display: flex;
  }
`;

export const FileUploadContainer = styled.section`
  position: relative;
  margin: 5px 0 5px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  justify-content: center;
  border: 1px dashed lightgrey;
  &:hover {
    opacity: 0.55;

    ${FileMetaData} {
      display: ${props => (!props.isImageFile ? 'none' : 'flex')};
      opacity: 1;
    }
  }
`;

export const RemoveFileIcon = styled.i`
  cursor: pointer;

  &:hover {
    transform: scale(1.5);
  }
`;

export const ImagePreview = styled.img`
  border-radius: 6px;
  width: 100%;
  height: 100%;
`;
