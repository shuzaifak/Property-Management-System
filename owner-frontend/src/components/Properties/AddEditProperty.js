import React, { useEffect, useState } from 'react';
import { Typography, Paper, TextField, Button, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AddEditProperty = ({ mode }) => {
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
        const res = await api.get(`/properties?id=${id}`);
        const prop = res.data[0];
        setTitle(prop.title);
        setAddress(prop.address);
        setPrice(prop.price);
        setDescription(prop.description || '');
        setExistingImages(prop.images || []);
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
    images.forEach((image, index) => {
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
    <>
      <Typography variant="h4" gutterBottom>
        {propertyId ? 'Edit Property' : 'Add Property'}
      </Typography>
      <Paper sx={{ p: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <TextField 
          label="Title" 
          variant="outlined" 
          fullWidth 
          sx={{ mb: 2 }} 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />
        <TextField 
          label="Address" 
          variant="outlined" 
          fullWidth 
          sx={{ mb: 2 }} 
          value={address} 
          onChange={e => setAddress(e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
        />
        <TextField 
          label="Price" 
          variant="outlined" 
          type="number" 
          fullWidth 
          sx={{ mb: 2 }} 
          value={price} 
          onChange={e => setPrice(e.target.value)}
          error={!!errors.price}
          helperText={errors.price}
        />
        <TextField 
          label="Description" 
          variant="outlined" 
          fullWidth 
          multiline 
          rows={4} 
          sx={{ mb: 2 }} 
          value={description} 
          onChange={e => setDescription(e.target.value)}
        />
        
        {/* Image Upload Section */}
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleImageChange} 
          disabled={images.length + existingImages.length >= 4}
        />
        {errors.images && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.images}
          </Typography>
        )}
        
        {/* Display Existing Images */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {existingImages.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img 
                src={`/uploads${img}`} 
                alt={`Property ${index + 1}`} 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
              />
              <Button 
                onClick={() => removeImage(index, true)} 
                color="error" 
                size="small"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        
        {/* Display New Images */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {images.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img 
                src={URL.createObjectURL(img)} 
                alt={`New Property ${index + 1}`} 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
              />
              <Button 
                onClick={() => removeImage(index)} 
                color="error" 
                size="small"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          sx={{ mt: 2 }}
        >
          {propertyId ? 'Update' : 'Add'}
        </Button>
      </Paper>
    </>
  );
};

export default AddEditProperty;