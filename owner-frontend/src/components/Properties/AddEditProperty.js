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
  Divider
} from '@mui/material';
import { Delete, CloudUpload, Home, LocationOn, AttachMoney } from '@mui/icons-material';
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
      // Fetch property data
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Address validation
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Price validation
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Images validation (for new property)
    if (!propertyId && images.length === 0 && existingImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    // Allow up to 4 images
    const selectedImages = Array.from(e.target.files).slice(0, 4 - images.length);
    setImages([...images, ...selectedImages]);
    
    // Clear image error when images are added
    if (selectedImages.length > 0) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Reset submit error
    setSubmitError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('address', address);
    formData.append('price', Number(price));
    formData.append('description', description);

    // Append images
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      if (propertyId) {
        await api.put(`/properties/${propertyId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/properties', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/properties');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to save property');
      console.error('Failed to save property', err.message);
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
    <Box 
      sx={{ 
        maxWidth: 800, 
        margin: 'auto', 
        padding: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper 
        elevation={12} 
        sx={{ 
          width: '100%',
          borderRadius: 4, 
          overflow: 'hidden',
          boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
          transform: 'perspective(1000px) rotateX(2deg)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'perspective(1000px) rotateX(0)'
          }
        }}
      >
        <Box 
          sx={{ 
            background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: 3,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              letterSpacing: 1,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            {propertyId ? 'Edit Property' : 'List New Property'}
          </Typography>
        </Box>

        <Box sx={{ padding: 4 }}>
          {submitError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Property Title" 
                variant="outlined" 
                fullWidth 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  startAdornment: (
                    <Home 
                      sx={{ 
                        color: 'action.active', 
                        mr: 1, 
                        fontSize: 24 
                      }} 
                    />
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField 
                label="Address" 
                variant="outlined" 
                fullWidth 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                InputProps={{
                  startAdornment: (
                    <LocationOn 
                      sx={{ 
                        color: 'action.active', 
                        mr: 1, 
                        fontSize: 24 
                      }} 
                    />
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField 
                label="Price" 
                variant="outlined" 
                type="number" 
                fullWidth 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: (
                    <AttachMoney 
                      sx={{ 
                        color: 'action.active', 
                        mr: 1, 
                        fontSize: 24 
                      }} 
                    />
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField 
                label="Description" 
                variant="outlined" 
                fullWidth 
                multiline 
                rows={4} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Property Images (Max 4)
                </Typography>
              </Divider>

              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2 
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={images.length + existingImages.length >= 4}
                  sx={{
                    borderRadius: 3,
                    padding: '10px 20px',
                    background: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
                    '&:hover': {
                      opacity: 0.9
                    }
                  }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>

              {errors.images && (
                <Typography 
                  color="error" 
                  variant="body2" 
                  align="center"
                  sx={{ mb: 2 }}
                >
                  {errors.images}
                </Typography>
              )}

              <Grid container spacing={2} justifyContent="center">
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box 
                      sx={{ 
                        position: 'relative', 
                        borderRadius: 3, 
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <img 
                        src={`/uploads${img}`} 
                        alt={`Property ${index + 1}`} 
                        style={{ 
                          width: '100%', 
                          height: 150, 
                          objectFit: 'cover'
                        }} 
                      />
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ 
                          position: 'absolute', 
                          top: 5, 
                          right: 5, 
                          backgroundColor: 'rgba(255,255,255,0.7)' 
                        }}
                        onClick={() => removeImage(index, true)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}

                {/* New Images */}
                {images.map((img, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box 
                      sx={{ 
                        position: 'relative', 
                        borderRadius: 3, 
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`New Property ${index + 1}`} 
                        style={{ 
                          width: '100%', 
                          height: 150, 
                          objectFit: 'cover'
                        }} 
                      />
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ 
                          position: 'absolute', 
                          top: 5, 
                          right: 5, 
                          backgroundColor: 'rgba(255,255,255,0.7)' 
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSubmit}
                sx={{
                  borderRadius: 3,
                  padding: '12px 0',
                  background: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 7px 14px rgba(50,50,93,0.1), 0 3px 6px rgba(0,0,0,0.08)'
                  }
                }}
              >
                {propertyId ? 'Update Property' : 'Add Property'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddEditProperty;