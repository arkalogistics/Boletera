// pages/api/webhooks/stripe.ts
import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ received: boolean } | string>
): Promise<void> {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).send('Missing Stripe signature');
    return;
  }

  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase
      .from('orders')
      .update({ paid: true })
      .eq('stripe_session', session.id);
  }

  res.status(200).json({ received: true });
}
