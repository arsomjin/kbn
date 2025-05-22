import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useParams } from 'react-router-dom';
import InputPrice from 'modules/account/InputPrice';

/**
 * Wrapper to extract provinceId and departmentId from params/context and pass to InputPrice
 */
export const InputPriceWrapper: React.FC = () => {
  const { userProfile } = useAuth();
  const { provinceId } = useParams<{ provinceId: string }>();
  return <InputPrice provinceId={provinceId || ''} departmentId={userProfile?.department || ''} />;
};

export default InputPriceWrapper;
