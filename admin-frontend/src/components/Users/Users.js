import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Avatar, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel, IconButton, Tooltip, Alert, CircularProgress,
  InputAdornment, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import api from '../../utils/api';

const ROLE_COLORS = {
  admin: { bg: 'rgba(123, 44, 191, 0.2)', text: '#c77dff', border: 'rgba(123, 44, 191, 0.5)' },
  owner: { bg: 'rgba(0, 180, 216, 0.15)', text: '#00b4d8', border: 'rgba(0, 180, 216, 0.4)' },
  tenant: { bg: 'rgba(0, 245, 212, 0.12)', text: '#60a5fa', border: 'rgba(0, 245, 212, 0.35)' },
};

const emptyForm = { name: '', email: '', password: '', role: 'tenant' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/all');
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setDialogMode('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormError('');
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (dialogMode === 'create' && !form.password)) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (dialogMode === 'create') {
        await api.post('/users/admin/create', form);
        setSuccess('User created successfully.');
      } else {
        const payload = { name: form.name, email: form.email, role: form.role };
        await api.put(`/users/admin/${selectedUser._id}`, payload);
        setSuccess('User updated successfully.');
      }
      setDialogOpen(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (user) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/admin/${userToDelete._id}`);
      setSuccess('User deleted successfully.');
      setDeleteOpen(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const avatarColors = ['#2563eb', '#00b4d8', '#e63946', '#f4a261', '#2a9d8f', '#e9c46a'];
  const getAvatarColor = (id) => avatarColors[(id?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(123, 44, 191, 0.15)', border: '1px solid rgba(123,44,191,0.3)' }}>
            <PeopleAltIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>User Management</Typography>
            <Typography variant="body2" color="textSecondary">{filtered.length} users total</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', borderRadius: 3, px: 3 }}
        >
          Add User
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by name, email or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.4)' }} /></InputAdornment> }}
      />

      {/* Users Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#2563eb' }} /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {filtered.map((user) => {
            const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.tenant;
            return (
              <Box key={user._id} className="glass-card" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 52, height: 52, bgcolor: getAvatarColor(user._id), fontWeight: 700, fontSize: '1.2rem', boxShadow: `0 0 0 3px ${roleStyle.border}` }}
                  >
                    {!user.avatar && getInitials(user.name)}
                  </Avatar>
                  <Box flexGrow={1} overflow="hidden">
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{user.name}</Typography>
                    <Typography variant="body2" color="textSecondary" noWrap sx={{ fontSize: '0.8rem' }}>{user.email}</Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      bgcolor: roleStyle.bg,
                      color: roleStyle.text,
                      border: `1px solid ${roleStyle.border}`,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit User">
                      <IconButton onClick={() => openEdit(user)} size="small" sx={{ color: '#00b4d8', bgcolor: 'rgba(0,180,216,0.1)', '&:hover': { bgcolor: 'rgba(0,180,216,0.2)' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton onClick={() => openDelete(user)} size="small" sx={{ color: '#e63946', bgcolor: 'rgba(230,57,70,0.1)', '&:hover': { bgcolor: 'rgba(230,57,70,0.2)' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(18, 18, 24, 0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {dialogMode === 'create' ? '✦ Create New User' : '✦ Edit User'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}
          <TextField label="Full Name *" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email Address *" fullWidth value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {dialogMode === 'create' && (
            <TextField label="Password *" type="password" fullWidth value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          )}
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={e => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained" sx={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', px: 3 }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : dialogMode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { background: 'rgba(18, 18, 24, 0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#e63946' }}>⚠ Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleDelete} disabled={deleting} variant="contained" color="error" sx={{ px: 3 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;

