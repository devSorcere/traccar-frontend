import React from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import theme from './common/theme';

const AppThemeProvider = ({ children }) => {
  const user = useSelector((state) => state.session.user);
  const userDarkMode = user?.attributes?.darkMode;
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: light)');
  const darkMode = userDarkMode !== undefined ? userDarkMode : preferDarkMode;

  const themeInstance = theme(user, darkMode);

  return (
    <ThemeProvider theme={themeInstance}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
