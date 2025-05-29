import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, seats, userEmail } = req.body as {
    eventId: string;
    seats: string[];
    userEmail: string;
  };

  // 1) Crear sesión de Stripe
  const line_items = seats.map(id => ({
    price_data: {
      currency: 'mxn',
      product_data: { name: `Asiento ${id}` },
      unit_amount: 5000, // $50.00
    },
    quantity: 1
  }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`
  });

  // 2) Crear la orden (paid = false)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      event_id: eventId,
      user_email: userEmail,
      stripe_session: session.id
    }])
    .select('id')
    .single();

  if (orderError) {
    console.error(orderError);
    return res.status(500).json({ error: 'Error al crear la orden' });
  }

  // 3) Insertar cada asiento en order_items
  await Promise.all(
    seats.map(seatId =>
      supabase
        .from('order_items')
        .insert({ order_id: order.id, seat_id: seatId })
    )
  );

  res.json({ sessionUrl: session.url });
}
