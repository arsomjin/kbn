import React from 'react';
import numeral from 'numeral';
import { isMobile } from 'react-device-detect';
import { FormInput, InputGroup, InputGroupAddon, InputGroupText } from 'shards-react';
import colors from 'utils/colors';
import { w, t, h } from './Dimensions';

import http from './http-common';

const uploadFile = (file, onUploadProgress) => {
  let formData = new FormData();

  formData.append('file', file);

  return http.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
};

const getFiles = () => {
  return http.get('/files');
};

export { w, h, t, uploadFile, getFiles };

export const getDepartmentIcon = (dp, type) => {
  switch (dp) {
    case 'dep0001':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          local_shipping
        </i>
      );
    case 'dep0002':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          loyalty
        </i>
      );
    case 'dep0003':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          store
        </i>
      );
    case 'dep0004':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          storefront
        </i>
      );
    case 'dep0005':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          point_of_sale
        </i>
      );
    case 'dep0006':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          engineering
        </i>
      );
    case 'dep0008':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          engineering
        </i>
      );
    case 'dep0009':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          account_balance
        </i>
      );
    case 'dep0010':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          group
        </i>
      );
    case 'dep0011':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          inventory
        </i>
      );
    case 'dep0012':
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          paid
        </i>
      );
    default:
      return (
        <i
          className="material-icons"
          {...(type && {
            style: { color: getColorFromStatus(type) }
          })}
        >
          campaign
        </i>
      );
  }
};

export const getColorFromStatus = st => {
  switch (st) {
    case 'success':
      return colors.success.toRGBA();
    case 'error':
      return colors.danger.toRGBA();
    case 'info':
      return colors.primary.toRGBA();
    case 'warning':
      return colors.warning.toRGBA();

    default:
      return colors.info.toRGBA();
  }
};

export const PageSummary = ({ title, data, alignLeft }) => {
  // Adjust widths as you like:
  const containerWidth = isMobile ? '100%' : '520px';
  const labelWidth = isMobile ? '200px' : '340px';

  return (
    // Remove `my-3` to avoid extra top/bottom margin
    <div className={`d-flex flex-column ${alignLeft ? '' : 'align-items-end'}`} style={{ margin: 0, padding: 0 }}>
      <div style={{ width: containerWidth, margin: 0, padding: 0 }}>
        {title && (
          // Remove default heading margin
          <h6 style={{ margin: 6, marginTop: 12, padding: 0 }}>{title}</h6>
        )}

        {data.map((it, n) => (
          <InputGroup
            key={n}
            // Remove any default bottom margin
            className="mb-0"
            style={{
              margin: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <InputGroupAddon type="prepend" style={{ margin: 0, padding: 0, overflow: 'auto' }}>
              <InputGroupText
                style={{
                  margin: 0,
                  padding: '0.375rem 0.75rem',
                  width: labelWidth,
                  fontWeight: it.bold ? 'bold' : 'normal'
                }}
                className={it.text ? `text-${it.text}` : n === data.length - 1 ? 'text-primary' : ''}
              >
                {it.item}
              </InputGroupText>
            </InputGroupAddon>

            <FormInput
              disabled
              style={{
                margin: 0,
                padding: '0.375rem 0.75rem',
                fontWeight: it.bold ? 'bold' : 'normal',
                textAlign: 'right',
                flex: '1 1 auto',
                minWidth: 0
              }}
              className={it.text ? `text-${it.text}` : n === data.length - 1 ? 'text-primary' : ''}
              value={numeral(it.value).format('0,0.00')}
            />

            {!isMobile && (
              <InputGroupAddon type="append" style={{ margin: 0, padding: 0 }}>
                <InputGroupText
                  style={{
                    margin: 0,
                    padding: '0.375rem 0.75rem',
                    minWidth: '50px',
                    textAlign: 'center',
                    fontWeight: it.bold ? 'bold' : 'normal'
                  }}
                  className={it.text ? `text-${it.text}` : n === data.length - 1 ? 'text-primary' : ''}
                >
                  บาท
                </InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        ))}
      </div>
    </div>
  );
};
