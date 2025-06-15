import express from 'express';
import Stripe from 'stripe';
import db from '../../database/connection.js';

import { sendTicketEmail } from '../../util/nodeMailer.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/events/:id/create-payment-intent', async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await db('events').where({ id: eventId }).select('title', 'price', 'accepts_online_payment').first();
    if (!event || !event.accepts_online_payment || !event.price || event.price <= 0) {
      return res.status(400).send({ message: 'This event is not available for online payment.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.price * 100,
      currency: 'dkk',
      description: `Ticket for ${event.title}`,
      metadata: { eventId },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return res.send({
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: 'Failed to create payment intent.' });
  }
});

router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).send('Webhook secret is not configured.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      const paymentMethodId = paymentIntent.payment_method;
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (!paymentMethod || !paymentMethod.billing_details) {
        return res.status(200).send();
      }

      const [insertedTicket] = await db('tickets').insert({
        event_id: paymentIntent.metadata.eventId,
        customer_name: paymentMethod.billing_details.name,
        customer_email: paymentMethod.billing_details.email,
        customer_address: paymentMethod.billing_details.address.line1,
        customer_postal_code: paymentMethod.billing_details.address.postal_code,
        amount_paid: paymentIntent.amount,
        stripe_payment_intent_id: paymentIntent.id,
      }).returning(
        [
          'public_id as publicId',
          'event_id as eventId',
          'customer_name as customerName',
          'customer_email as customerEmail',
          'amount_paid as amountPaid',
        ],
      );

      if (!insertedTicket) {
        throw new Error('Ticket creation failed after insert.');
      }

      const eventDetails = await db('events').where({ id: insertedTicket.eventId }).first();

      if (!eventDetails) {
        throw new Error(`Could not find event with ID ${insertedTicket.eventId}`);
      }

      sendTicketEmail(insertedTicket, eventDetails);
    } catch (error) {
      return res.status(500).send({ message: 'Error saving ticket information.' });
    }
  }

  return res.status(200).send();
});
export default router;
