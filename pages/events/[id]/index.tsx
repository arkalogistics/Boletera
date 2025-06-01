// pages/events/[id]/index.tsx  (o el nombre que uses para la ruta dinámica)
import { useRouter } from "next/router";
import { SeatMap } from "../../../components/SeatMap";
import { Button, Box, VStack, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function EventPage() {
  const router = useRouter();
  const { id } = router.query; // eventId

  // Estado para almacenar los asientos seleccionados (recibidos de SeatMap)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Este método se llamará cuando el usuario pulse “Continuar al Checkout”
  const handleNext = () => {
    if (!id) return;
    if (selectedSeats.length === 0) {
      alert("Por favor selecciona al menos una butaca.");
      return;
    }
    // Navegar a /events/[id]/checkout?seats=A-1,B-2,...
    router.push({
      pathname: `/events/${id}/checkout`,
      query: { seats: selectedSeats.join(",") },
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Página de Evento (ID: {id})
        </Text>

        {/* SeatMap recibe el callback */}
        <SeatMap
          soldSeats={[]} // aquí pasarías los seats ya vendidos desde Supabase
          onSelectionChange={(seats) => {
            setSelectedSeats(seats);
          }}
        />

        {/* Botón para ir a Checkout */}
        <Button
          colorScheme="cyan"
          size="lg"
          onClick={handleNext}
          isDisabled={selectedSeats.length === 0}
        >
          Continuar al Checkout ({selectedSeats.length} asientos)
        </Button>
      </VStack>
    </Box>
  );
}
