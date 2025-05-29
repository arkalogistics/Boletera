import { useRouter } from 'next/router';
import { SeatMap } from '../../../components/SeatMap';
import { Button, Box } from '@chakra-ui/react';

export default function EventPage() {
  const router = useRouter();
  const { id } = router.query;

  const handleNext = () => {
    // pasar selected al checkout (p.ej. via contexto, query o localStorage)
    router.push(`/events/${id}/checkout`);
  };

  return (
    <Box p={6}>
      <SeatMap eventId={id as string} />
      <Button mt={4} colorScheme="teal" onClick={handleNext}>
        Continuar a Checkout
      </Button>
    </Box>
  );
}
