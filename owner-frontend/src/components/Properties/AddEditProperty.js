import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  Grid, 
  Box, 
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AddEditProperty = () => {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setPropertyId(id);
      const fetchProperty = async () => {
        try {
          const res = await api.get(`/properties?id=${id}`);
          const prop = res.data[0];
          setTitle(prop.title);
          setAddress(prop.address);
          setPrice(prop.price);
          setDescription(prop.description || '');
          setExistingImages(prop.images || []);
        } catch (error) {
          console.error('Failed to fetch property', error);
          setSubmitError('Failed to load property details');
        }
      };
      fetchProperty();
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!price) newErrors.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!propertyId && images.length === 0 && existingImages.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files).slice(0, 4 - (images.length + existingImages.length));
    setImages([...images, ...selectedImages]);
    if (selectedImages.length > 0) setErrors(prev => ({ ...prev, images: undefined }));
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('address', address);
    formData.append('price', Number(price));
    formData.append('description', description);
    images.forEach((image) => formData.append('images', image));

    try {
      if (propertyId) {
        await api.put(`/properties/${propertyId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/properties');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to save property');
    }
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
    } else {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', py: 2, px: { xs: 1, sm: 0 } }}>
      <Box sx={{ mb: 4, px: { xs: 1, sm: 0 } }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 800, 
          mb: 1,
          fontSize: { xs: '1.75rem', sm: '2.125rem' } 
        }}>
          {propertyId ? 'Edit Property' : 'Add New Property'}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Fill in the details below to {propertyId ? 'update your' : 'list a new'} property.
        </Typography>
      </Box>

      <Paper className="glass-panel" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: 'none' }}>
        {submitError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{submitError}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField 
              label="Property Title" 
              fullWidth 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField 
              label="Address" 
              fullWidth 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField 
              label="Price (per month)" 
              type="number" 
              fullWidth 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField 
              label="Description" 
              fullWidth 
              multiline 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1, opacity: 0.1 }} />
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2, mt: 1 }}>
              Property Images (Max 4)
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={images.length + existingImages.length >= 4}
                sx={{ borderRadius: 3, px: 3, borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                Upload Images
                <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
              </Button>
            </Stack>

            {errors.images && <Typography color="error" variant="caption" display="block" sx={{ mb: 2 }}>{errors.images}</Typography>}

            <Grid container spacing={2}>
              {existingImages.map((img, index) => (
                <Grid item xs={6} sm={3} key={`existing-${index}`}>
                  <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', height: 120 }}>
                    <img src={`http://localhost:5000${img}`} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton size="small" color="error" sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }} onClick={() => removeImage(index, true)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Grid>
              ))}
              {images.map((img, index) => (
                <Grid item xs={6} sm={3} key={`new-${index}`}>
                  <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', height: 120 }}>
                    <img src={URL.createObjectURL(img)} alt="New Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton size="small" color="error" sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }} onClick={() => removeImage(index)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => navigate('/properties')} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)', 
                  borderRadius: 3, 
                  px: 4, 
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(37,99,235,0.4)'
                }}
              >
                {propertyId ? 'Update Property' : 'List Property'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddEditProperty;