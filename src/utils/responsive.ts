import { Dimensions, Platform } from 'react-native';

export const getWindowDimensions = () => {
  return Dimensions.get('window');
};

export const isWeb = Platform.OS === 'web';

export const isDesktop = () => {
  if (!isWeb) return false;
  const { width } = getWindowDimensions();
  return width >= 768;
};

export const isTablet = () => {
  const { width } = getWindowDimensions();
  return width >= 768 && width < 1024;
};

export const isLargeDesktop = () => {
  if (!isWeb) return false;
  const { width } = getWindowDimensions();
  return width >= 1024;
};

export const getMaxContentWidth = () => {
  const { width } = getWindowDimensions();
  if (width >= 1440) return 1200; // Large desktop: max 1200px
  if (width >= 1024) return 960;  // Desktop: max 960px
  if (width >= 768) return 720;   // Tablet: max 720px
  return width; // Mobile: full width
};

export const getResponsivePadding = () => {
  const { width } = getWindowDimensions();
  if (width >= 1024) return 40;
  if (width >= 768) return 32;
  return 20;
};

export const getColumnCount = () => {
  const { width } = getWindowDimensions();
  if (width >= 1440) return 3;
  if (width >= 1024) return 2;
  return 1;
};
