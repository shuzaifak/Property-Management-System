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
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PriceIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

// Styled components
const GradientBackground = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    borderColor: 'rgba(37, 99, 235, 0.5)',
  }
}));

const ResidenceCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  borderRadius: theme.spacing(3),
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(59, 130, 246, 0.5)',
  boxShadow: '0 0 30px rgba(37, 99, 235, 0.15)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.01)',
  }
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2rem',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const PropertyList = () => {
  const { user } = useContext(AuthContext);
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

  const handleContactOwner = async (property) => {
    try {
      const res = await axios.post('/properties/contact-owner', { 
        propertyId: property._id 
      });
      toast.success(res.data.message || 'Inquiry sent to the owner!');
    } catch (error) {
      console.error('Contact owner error:', error);
      toast.error(error.response?.data?.message || 'Failed to send inquiry.');
    }
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

      {/* Current Residence Section */}
      {user?.currentLease && (
        <Box sx={{ mb: 8 }}>
          <SectionHeader sx={{ color: '#60a5fa', WebkitTextFillColor: 'unset', background: 'unset' }}>
            <HomeWorkIcon sx={{ fontSize: '2.5rem' }} /> Your Current Residence
          </SectionHeader>
          
          <Grid container>
            {properties
              .filter(p => p._id === (user.currentLease.property?._id || user.currentLease.property || user.currentLease))
              .map((property) => (
                <Grid item xs={12} key={property._id}>
                  <ResidenceCard sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                    <CardMedia
                      component="img"
                      image={property.images[0] || '/default-property.jpg'}
                      alt={property.title}
                      sx={{ 
                        width: { xs: '100%', md: 450 },
                        height: { xs: 250, md: 'auto' },
                        cursor: 'pointer',
                        filter: 'brightness(0.9)',
                        transition: 'filter 0.3s',
                        '&:hover': { filter: 'brightness(1.1)' }
                      }}
                      onClick={() => handleOpenImageDialog(property)}
                    />
                    <CardContent sx={{ flex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1 }}>
                            {property.title}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon fontSize="small" /> {property.address}
                          </Typography>
                        </Box>
                        <Chip 
                          label="ACTIVE LEASE" 
                          sx={{ 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#10b981', 
                            fontWeight: 700,
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '8px'
                          }} 
                        />
                      </Box>

                      <Typography variant="body1" sx={{ color: '#cbd5e1', mt: 2, mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                        {property.description}
                      </Typography>

                      <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                        <Button 
                          variant="contained" 
                          href="/dashboard/pay-rent"
                          sx={{ 
                            borderRadius: 2, 
                            px: 4, 
                            py: 1.5,
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                            fontWeight: 700
                          }}
                        >
                          Quick Pay Rent
                        </Button>
                        <Button 
                          variant="outlined" 
                          href="/dashboard/lease-agreements"
                          sx={{ 
                            borderRadius: 2, 
                            px: 4, 
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: '#f1f5f9',
                            '&:hover': { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)' }
                          }}
                        >
                          View Agreement
                        </Button>
                      </Box>
                    </CardContent>
                  </ResidenceCard>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      <SectionHeader>
        {user?.currentLease ? 'Browse Other Properties' : 'Available Properties'}
      </SectionHeader>

      {!user?.currentLease && properties.length === 0 ? (
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
          {properties
            .filter(p => p._id !== (user.currentLease?.property?._id || user.currentLease?.property || user.currentLease))
            .map((property) => (
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
                    onClick={() => handleContactOwner(property)}
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