import React from 'react';
import { 
  Box, 
  Toolbar, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';

// Create a custom theme for a more appealing design
const theme = createTheme({
  palette: {
    background: {
      default: '#f4f6f8',
      paper: '#ffffff'
    },
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f'
    }
  },
  components: {
    MuiBox: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        }
      }
    }
  }
});

const MainLayout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        display="flex" 
        sx={{ 
          minHeight: '100vh', 
          backgroundColor: theme.palette.background.default 
        }}
      >
        <Sidebar />
        <Box 
          flexGrow={1} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: theme.palette.background.default 
          }}
        >
          <Topbar />
          <Toolbar />
          <Box 
            padding={3} 
            sx={{ 
              flexGrow: 1, 
              backgroundColor: theme.palette.background.default 
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;