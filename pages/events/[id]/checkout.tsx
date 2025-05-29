import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Box, List, ListItem, Text } from '@chakra-ui/react';
import { supabase } from '../../../lib/supabaseClient';

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedSeats, setSeats] = useState<string[]>([]);

  useEffect(() => {
    // recuperar selección (ejemplo desde localStorage)
    const sel = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    setSeats(sel);
  }, []);

  const handlePay = async () => {
    const { data } = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ eventId: id, seats: selectedSeats })
    }).then(r => r.json());
    window.location = data.sessionUrl; // redirige a Stripe
  };

  return (
    <Box p={6}>
      <Text fontSize="xl" mb={4}>Tus asientos:</Text>
      <List spacing={2}>
        {selectedSeats.map(s => <ListItem key={s}>{s}</ListItem>)}
      </List>
      <Button mt={6} colorScheme="green" onClick={handlePay}>
        Ir a pagar
      </Button>
    </Box>
  );
}
