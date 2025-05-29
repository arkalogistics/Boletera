import { Box, Image } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function SeatMap({ eventId }: { eventId: string }) {
  const [seats, setSeats]       = useState<any[]>([]);
  const [soldSeatIds, setSold]  = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      // 1) todos los asientos del venue
      supabase.from('seats').select('*'),
      // 2) los asientos ya vendidos (order_items JOIN orders)
      supabase
        .from('order_items')
        .select('seat_id, order(paid, event_id)')
        .eq('order.event_id', eventId)
        .eq('order.paid', true)
    ]).then(([sRes, oiRes]) => {
      setSeats(sRes.data || []);
      setSold(new Set((oiRes.data || []).map(item => item.seat_id)));
    });
  }, [eventId]);

  const toggle = (id: string) => {
    if (soldSeatIds.has(id)) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <Box position="relative"  bg="gray.100">
      {seats.map(seat => (
        <Box
          key={seat.id}
          position="absolute"
          top={`${seat.y}px`}
          left={`${seat.x}px`}
          cursor={soldSeatIds.has(seat.id) ? 'not-allowed' : 'pointer'}
          onClick={() => toggle(seat.id)}
        >
          <Image
            boxSize="60px"
            src={
              soldSeatIds.has(seat.id)
                ? '/seat-sold.png'
                : selected.has(seat.id)
                  ? '/seat-selected.png'
                  : '/seat-available.png'
            }
          />
        </Box>
      ))}
    </Box>
  );
}
