// backend/utils/paymentGateway.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 

exports.chargePayment = async (amount, paymentMethodId, description) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description,
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

