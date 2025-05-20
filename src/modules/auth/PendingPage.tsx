import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import gsap from 'gsap';
import { useAuth } from 'contexts/AuthContext';
import { useAntdMessage } from 'hooks/useAntdMessage';
import { getCurrentUserProfile } from '../../services/authService';
import welcomeImage from '../../assets/images/welcome.png';
import { ROLES } from '../../constants/roles';

const PendingPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { notification } = useAntdMessage();
  const welcome = useRef<HTMLHeadingElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const paragraph = useRef<HTMLParagraphElement>(null);
  const first1 = useRef(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const prevRole = useRef(userProfile?.role);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 480;
  const isTablet = windowWidth >= 480 && windowWidth < 768;

  useEffect(() => {
    if (!first1.current) {
      // Optionally, update profile in Redux if needed
      // dispatch(updateProfile({ profile: userProfile }));
    }
    first1.current = false;
  }, [userProfile, dispatch]);

  useEffect(() => {
    gsap.to(welcome.current, {
      x: 0,
      color: 'white',
      opacity: 1,
      duration: 1
    });
    gsap.to(title.current, {
      x: 0,
      opacity: 1,
      delay: 0.2,
      duration: 1
    });
    gsap.to(paragraph.current, {
      x: 0,
      opacity: 1,
      delay: 0.5,
      duration: 1
    });
  }, []);

  const explore = async () => {
    try {
      const profile = await getCurrentUserProfile();
      console.log('Profile:', profile);
      if (profile && (profile as any).permissions?.granted) {
        window.location.reload();
      } else {
        notification.info({
          message: 'กรุณารอเราตรวจสอบและยืนยันตัวตนของท่าน ก่อนเข้าใช้งาน'
        });
      }
    } catch (e: any) {
      notification.warning({
        message: e?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      });
    }
  };

  return (
    <main className='w-full flex items-center justify-center min-h-screen text-tw-black dark:text-tw-white relative overflow-hidden bg-background1 dark:bg-background1'>
      <div
        className='wave-effect absolute w-full h-full bg-no-repeat bg-cover'
        style={{
          backgroundImage: `url(${welcomeImage})`,
          opacity: 0.35
        }}
      ></div>
      <div className='absolute bg-gradient-to-b from-background2/90 to-black/95 opacity-80 inset-0 z-0'></div>
      <section className='w-[90vw] max-w-2xl h-full mx-auto flex items-center justify-center relative z-10'>
        <div
          className={`backdrop-blur-lg bg-white/70 dark:bg-black/60 rounded-3xl shadow-2xl ${isMobile ? 'px-5 py-8' : 'px-10 py-16'} flex flex-col items-center gap-8 border border-background2/60 transition-all duration-300`}
        >
          <div className='text-center drop-shadow-xl'>
            <h3
              className={`${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'} font-bold tracking-wide lg:text-4xl text-secondary dark:text-secondary mb-2 drop-shadow-md`}
              ref={welcome}
            >
              บัญชีของคุณกำลังรออนุมัติ
            </h3>
            <h1
              className={`pb-4 pt-2 bg-gradient-to-b from-primary to-secondary bg-clip-text ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl'} font-extrabold text-transparent md:text-6xl drop-shadow-xl border-b-2 border-primary/30 mb-2`}
              ref={title}
            >
              คูโบต้า เบญจพล
            </h1>
          </div>
          <p
            className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} text-gray-800 dark:text-gray-200 font-medium text-center w-full max-w-xl mt-2 mb-4 drop-shadow tracking-wide`}
            ref={paragraph}
          >
            บัญชีของคุณกำลังอยู่ในระหว่างการตรวจสอบ
            <br />
            กรุณารอการอนุมัติจากผู้ดูแลระบบ
            <br />
            เราจะแจ้งให้คุณทราบทางอีเมลเมื่อบัญชีของคุณพร้อมใช้งาน
          </p>
          <button
            onClick={explore}
            className={`z-10 bg-primary/90 text-tw-white dark:text-tw-black font-semibold tracking-wide ${isMobile ? 'px-8 py-2 text-base' : 'px-16 py-3 text-lg'} rounded-xl border-2 border-secondary mt-4 hover:bg-secondary hover:text-tw-white dark:hover:text-tw-black duration-300 shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/60`}
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </section>
    </main>
  );
};

export default PendingPage;
