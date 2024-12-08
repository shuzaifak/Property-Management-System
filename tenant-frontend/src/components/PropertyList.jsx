import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriceIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { toast } from 'react-toastify';

// Styled components
const GradientBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
  }
}));

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const fetchProperties = async () => {
    try {
      const res = await axios.get('/properties');
      
      console.log('Fetched Properties:', res.data);
  
      const processedProperties = res.data.map(property => {
        const processedImages = property.images.map(imagePath => {
          const fullImageUrl = `http://localhost:5000${imagePath}`;
          console.log('Image Full URL:', fullImageUrl);
          return fullImageUrl;
        });
  
        return {
          ...property,
          images: processedImages.length > 0 ? processedImages : ['/default-property.jpg']
        };
      });
  
      console.log('Processed Properties:', processedProperties);
      
      setProperties(processedProperties);
    } catch (error) {
      console.error('Properties fetch error:', error.response ? error.response.data : error);
      toast.error('Failed to fetch properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenImageDialog = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedProperty) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedProperty.images.length
      );
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (selectedProperty) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 
          ? selectedProperty.images.length - 1 
          : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Finding your perfect home...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <GradientBackground>
        <Typography 
          variant="h3" 
          align="center" 
          sx={{ 
            fontWeight: 700, 
            letterSpacing: '-0.05em' 
          }}
        >
          Discover Your Next Home
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ mt: 2, opacity: 0.8 }}
        >
          Browse through our carefully curated rental listings
        </Typography>
      </GradientBackground>

      {properties.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mt: 4 
          }}
        >
          <Typography 
            variant="h5" 
            color="textSecondary" 
            sx={{ mb: 2 }}
          >
            No properties available right now
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Check back later or contact our leasing office
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <PropertyCard>
              <CardMedia
              component="img"
              height="200"
              image={property.images[0] || '/default-property.jpg'}
              alt={property.title}
              onClick={() => handleOpenImageDialog(property)} // Ensure this is called
              sx={{ 
                cursor: 'pointer',
                objectFit: 'cover'
              }}
            />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2 
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main' 
                      }}
                    >
                      {property.title}
                    </Typography>
                    <Chip 
                      icon={<LocationOnIcon />} 
                      label={property.address || 'Location'} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriceIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Price
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      sx={{ fontWeight: 700 }}
                    >
                      Rs.{property.price}/month
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      height: 60, 
                      overflow: 'hidden' 
                    }}
                  >
                    {property.description || 'No description available'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Contact Owner
                  </Button>
                </CardActions>
              </PropertyCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Image Dialog */}
      {selectedProperty && (
        <Dialog 
          open={imageDialogOpen} 
          onClose={handleCloseImageDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedProperty.title} - Images
            <Typography variant="body2" color="text.secondary">
              {currentImageIndex + 1} / {selectedProperty.images.length}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', width: '100%', height: '500px' }}>
              {selectedProperty.images.length > 1 && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 10 
                  }}
                >
                  <Button 
                    onClick={handlePrevImage}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    <ArrowBackIosIcon />
                  </Button>
                </Box>
              )}
              
              <img 
                src={selectedProperty.images[currentImageIndex]} 
                alt={selectedProperty.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              
              {selectedProperty.images.length > 1 && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 10 
                  }}
                >
                  <Button 
                    onClick={handleNextImage}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    <ArrowForwardIosIcon />
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default PropertyList;