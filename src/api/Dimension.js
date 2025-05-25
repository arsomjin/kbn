const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

export const w = (percent) => {
  return Math.round(screenWidth * (percent / 100));
};

export const h = (percent) => {
  return Math.round(screenHeight * (percent / 100));
};

export const t = (num) => {
  return Math.round(
    (Math.sqrt(screenHeight * screenHeight + screenWidth * screenWidth) * num) / 100,
  );
};

export const isLandscape = screenWidth > screenHeight;
