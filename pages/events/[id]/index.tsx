// pages/events/[id]/index.tsx
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SeatMap } from "../../../components/SeatMap";
import { Button, Box, VStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Props = {
  eventId: string;
  soldSeats: string[]; // aquí estarán los seat_id ya vendidos, ej. ["A-1","B-8",…]
};

export default function EventPage({ eventId, soldSeats }: Props) {
  const router = useRouter();
  // (router.query.id debería ser igual a eventId)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleNext = () => {
    if (!eventId) return;
    if (selectedSeats.length === 0) {
      alert("Por favor selecciona al menos una butaca.");
      return;
    }
    // Redirigimos a /events/[eventId]/checkout?seats=A-1,B-2,...
    router.push({
      pathname: `/events/${eventId}/checkout`,
      query: { seats: selectedSeats.join(",") },
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Evento: {eventId}
        </Text>

        {/* Le pasamos a SeatMap el array de butacas vendidas */}
        <SeatMap
          soldSeats={soldSeats}
          onSelectionChange={(seats) => {
            setSelectedSeats(seats);
          }}
        />

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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { id } = ctx.params!; // id del evento
  if (!id || typeof id !== "string") {
    return {
      notFound: true,
    };
  }
  const eventId = id;

  // ─── 1) Obtener todos los orders que pertenecen a este evento ───────────
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("event_id", eventId);

  if (ordersError) {
    console.error("Error consultando orders:", ordersError);
    return {
      props: {
        eventId,
        soldSeats: [], // En caso de falla, enviamos vacío para no bloquear el mapa
      },
    };
  }

  const orderIds = orders?.map((o) => o.id) || [];

  // ─── 2) Con esos orderIds, obtener todos los tickets que correspondan ────
  let soldSeats: string[] = [];
  if (orderIds.length > 0) {
    // Leemos de la tabla `tickets`, filtrando por order_id IN (orderIds)
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("seat_id")
      .in("order_id", orderIds);

    if (ticketsError) {
      console.error("Error consultando tickets:", ticketsError);
      soldSeats = [];
    } else {
      // tickets = [ { seat_id: "A-5" }, { seat_id: "B-8" }, ... ]
      soldSeats = tickets.map((row) => row.seat_id);
    }
  }

  return {
    props: {
      eventId,
      soldSeats,
    },
  };
};
