import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const sidebarItems = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'My Properties', path: '/properties', icon: <HomeWorkIcon /> },
  { name: 'Add Property', path: '/add-property', icon: <AddBoxIcon /> },
  { name: 'Profile', path: '/profile', icon: <AccountCircleIcon /> }
];

export default sidebarItems;
