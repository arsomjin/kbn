import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

/**
 * Cover component for displaying overlay information with responsive design
 * @param {Object} props - Component props
 * @param {string|JSX.Element} props.info - Information to display in the overlay
 * @returns {JSX.Element} Full-screen overlay component
 */
const Cover = ({ info }) => {
  const { isMobile } = useResponsive();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-start z-50">
      {!!info && typeof info === 'string' && (
        <h6
          className={`
            fixed text-white text-center mx-5 mt-10
            ${isMobile ? 'text-sm px-4' : 'text-base px-6'}
            bg-black bg-opacity-30 rounded-lg p-4
            dark:bg-gray-800 dark:bg-opacity-40
          `}
        >
          {info}
        </h6>
      )}
      {!!info && typeof info !== 'string' && (
        <div
          className={`
          fixed mt-10 mx-5
          ${isMobile ? 'px-4' : 'px-6'}
        `}
        >
          {info}
        </div>
      )}
    </div>
  );
};

export default Cover;
