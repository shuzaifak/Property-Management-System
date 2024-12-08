// src/utils/validationSchemas.js
import * as Yup from 'yup';

// Login Validation Schema
export const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

// Register Validation Schema
export const registerSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
});


export const paymentSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  paymentMethod: Yup.string()
    .oneOf(['credit_card', 'paypal', 'bank_transfer'], 'Select a valid payment method')
    .required('Payment method is required'),
});
