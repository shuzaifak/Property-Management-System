import React, { useContext } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import DocumentIcon from '@mui/icons-material/Description';

const drawerWidth = 256;

const SideBar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const hasActiveLease = !!user?.currentLease;
  console.log('SideBar Debug - User:', user);
  console.log('SideBar Debug - Has Active Lease:', hasActiveLease);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <HomeIcon />,
      path: '/dashboard',
    },
    {
      text: 'Pay Rent',
      icon: <PaymentIcon />,
      path: '/dashboard/pay-rent',
      condition: hasActiveLease,
    },
    {
      text: 'Payment History',
      icon: <HistoryIcon />,
      path: '/dashboard/payment-history',
    },
    {
      text: 'Lease Agreements',
      icon: <DocumentIcon />,
      path: '/dashboard/lease-agreements',
      condition: hasActiveLease,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          }}>
            <Typography fontWeight={900} color="white" fontSize="1.1rem">P</Typography>
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1rem" sx={{ letterSpacing: 0.5, color: '#f1f5f9' }}>PropertySync</Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>Tenant Console</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

      {/* Nav items */}
      <Box sx={{ px: 1.5, pt: 2 }}>
        <Typography variant="caption" color="textSecondary" sx={{ px: 1.5, letterSpacing: 2, fontSize: '0.65rem', textTransform: 'uppercase' }}>
          Navigation
        </Typography>
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => {
            if (item.condition === false) return null;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
            return (
              <ListItemButton
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2.5, mb: 0.5, px: 2, py: 1.2, position: 'relative',
                  background: isActive ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' },
                  '& .MuiListItemIcon-root': { color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.4)', minWidth: 40, transition: 'color 0.2s' },
                  '& .MuiListItemText-primary': { color: isActive ? '#f1f5f9' : 'rgba(255,255,255,0.6)', fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' },
                }}
              >
                {isActive && (
                  <Box sx={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', borderRadius: '0 2px 2px 0',
                    background: 'linear-gradient(to bottom, #2563eb, #60a5fa)',
                  }} />
                )}
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer badge */}
      <Box sx={{ mt: 'auto', px: 2.5, py: 2.5 }}>
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>Tenant Portal</Typography>
          <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600 }}>Active Status</Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideBar;