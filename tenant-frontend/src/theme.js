// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize as needed
    },
    secondary: {
      main: '#dc004e', // Customize as needed
    },
  },
  typography: {
    h4: {
      marginBottom: '1rem',
    },
    // Add more typography customizations as needed
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          // Customize Drawer styles if needed
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Customize AppBar styles if needed
        },
      },
    },
    // Add more component customizations as needed
  },
});

export default theme;
