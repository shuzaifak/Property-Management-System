import React from 'react';
import MainLayout from '../layout/MainLayout';
import AddEditProperty from '../components/Properties/AddEditProperty';

const AddPropertyPage = () => (
  <MainLayout>
    <AddEditProperty mode="add" />
  </MainLayout>
);

export default AddPropertyPage;
