import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';

const sidebarItems = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'Users', path: '/users', icon: <PeopleIcon /> },
  { name: 'Properties', path: '/properties', icon: <HomeWorkIcon /> },
  { name: 'Payments', path: '/payments', icon: <PaymentsIcon /> },
  { name: 'Profile', path: '/profile', icon: <PersonIcon /> },
];

export default sidebarItems;
