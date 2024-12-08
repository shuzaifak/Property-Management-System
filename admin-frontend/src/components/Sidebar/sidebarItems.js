import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const sidebarItems = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'Users', path: '/users', icon: <PeopleIcon /> },
  { name: 'Properties', path: '/properties', icon: <HomeWorkIcon /> },
];

export default sidebarItems;
