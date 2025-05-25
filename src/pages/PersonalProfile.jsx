import React from 'react';
import { Card, Typography, Tag, Spin, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getRoleColor } from '../utils/roleUtils';
import styles from './PersonalProfile.module.css';
import dayjs from 'dayjs';
import { Timestamp, FieldValue } from 'firebase/firestore';

const { Title, Text } = Typography;

const PersonalProfile = () => {
  const { t } = useTranslation('profile');
  const { userProfile, loading, error } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip={t('personalProfile.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert message={t('personalProfile.error.loadingProfile')} type="error" showIcon />
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    // Handle Firestore Timestamp
    if (
      typeof date === 'object' &&
      date !== null &&
      'toDate' in date &&
      typeof date.toDate === 'function'
    ) {
      return dayjs(date.toDate()).format('YYYY-MM-DD HH:mm');
    }
    // Handle Firestore FieldValue (serverTimestamp)
    if (
      typeof date === 'object' &&
      date !== null &&
      date.constructor &&
      date.constructor.name === 'FieldValue'
    ) {
      return '-';
    }
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  };

  return (
    <div className={styles.profileContainer}>
      <Card className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" />
            ) : (
              <span>{userProfile?.displayName?.[0] || userProfile?.email?.[0]}</span>
            )}
          </div>
          <div className={styles.profileInfo}>
            <Title level={3} className={styles.profileName}>
              {userProfile?.displayName || userProfile?.email}
            </Title>
            {userProfile?.role && (
              <Tag color={getRoleColor(userProfile.role)} className={styles.roleTag}>
                {t(`roles.${userProfile.role.toLowerCase()}`)}
              </Tag>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <Title level={4}>{t('personalProfile.personalInfo')}</Title>
          <Card className={styles.infoCard}>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.email')}:</Text>
              <Text>{userProfile?.email || '-'}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.phone')}:</Text>
              <Text>{userProfile?.phoneNumber || '-'}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.employeeId')}:</Text>
              <Text>{userProfile?.employeeId || '-'}</Text>
            </div>
          </Card>
        </div>

        <div className={styles.infoSection}>
          <Title level={4}>{t('personalProfile.organizationInfo')}</Title>
          <Card className={styles.infoCard}>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.department')}:</Text>
              <Text>{userProfile?.department || '-'}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.branch')}:</Text>
              <Text>{userProfile?.branch || '-'}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.province')}:</Text>
              <Text>{userProfile?.province || '-'}</Text>
            </div>
          </Card>
        </div>

        <div className={styles.infoSection}>
          <Title level={4}>{t('personalProfile.accountInfo')}</Title>
          <Card className={styles.infoCard}>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.memberSince')}:</Text>
              <Text>{formatDate(userProfile?.createdAt)}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.lastLogin')}:</Text>
              <Text>{formatDate(userProfile?.lastLogin)}</Text>
            </div>
            <div className={styles.infoRow}>
              <Text strong>{t('personalProfile.verified')}:</Text>
              <Text>
                {userProfile?.isEmailVerified
                  ? t('personalProfile.status.active')
                  : t('personalProfile.status.pending')}
              </Text>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default PersonalProfile;
