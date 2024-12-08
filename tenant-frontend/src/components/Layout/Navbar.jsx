import React, { useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Avatar, 
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const drawerWidth = 280;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  backgroundImage: 'none',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
  }
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledAppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600, 
            color: 'primary.main' 
          }}
        >
          Tenant Portal
        </Typography>
        
        {user && (
          <UserSection>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <NotificationsNoneIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                src={user?.avatar} 
                alt={user?.name} 
                sx={{ width: 40, height: 40 }}
              />
              <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name || 'Tenant'}
              </Typography>
            </Box>

            <Tooltip title="Logout">
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText'
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </UserSection>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;