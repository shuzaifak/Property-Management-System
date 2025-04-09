// Update sidebarItems.js
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PaymentIcon from '@mui/icons-material/Payment'; // Add this import

const sidebarItems = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'My Properties', path: '/properties', icon: <HomeWorkIcon /> },
  { name: 'Add Property', path: '/add-property', icon: <AddBoxIcon /> },
  { name: 'Manage Tenants', path: '/manage-tenants', icon: <PeopleIcon /> },
  { name: 'Lease Agreements', path: '/lease-agreements', icon: <FileCopyIcon /> },
  { name: 'Payment History', path: '/owner-payment-history', icon: <PaymentIcon /> }, // New item
  { name: 'Profile', path: '/profile', icon: <AccountCircleIcon /> }
];

export default sidebarItems;