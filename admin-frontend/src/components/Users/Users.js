import React, { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';
import UserTable from './UserTable';
import api from '../../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get('/users/all');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Users</Typography>
      <Paper sx={{ p: 2 }}>
        <UserTable users={users} />
      </Paper>
    </>
  );
};

export default Users;
