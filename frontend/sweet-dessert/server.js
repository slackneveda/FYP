/* eslint-env node */
/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validate Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in .env file');
  console.error('Please add STRIPE_SECRET_KEY to your .env.local file');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create PaymentIntent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({ 
        error: 'Amount must be at least $0.50' 
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Stripe server running on http://localhost:${port}`);
  console.log('Endpoints available:');
  console.log(`  POST http://localhost:${port}/api/create-payment-intent`);
  console.log(`  GET  http://localhost:${port}/api/health`);
});