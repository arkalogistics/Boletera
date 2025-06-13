import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { withAdminSessionSsr } from "../../../lib/withAdminSessionSsr";
import { AdminSsrLogin } from "../../../components/AdminSsrLogin";
import { SeatMap } from "../../../components/SeatMap";
import {
  Box, Button, Center, Divider, FormControl, FormLabel,
  Input, Text, VStack, useToast, Spinner,
} from "@chakra-ui/react";

// Obtener los asientos vendidos desde Supabase vía API/DB
async function fetchSoldSeats(eventId: string): Promise<string[]> {
  const res = await fetch(`/api/tickets/sold-seats?eventId=${eventId}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.soldSeats ?? [];
}

export const getServerSideProps: GetServerSideProps = withAdminSessionSsr(async (ctx) => {
  const { id } = ctx.query;
  return { props: { authed: true, eventId: id || null } };
});

export default function AdminReservePage({ authed, error, eventId }: any) {
  const toast = useToast();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [buyer, setBuyer] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [soldSeats, setSoldSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  // Cargar los asientos ocupados al cargar la página o cambiar el evento
  useEffect(() => {
    if (!eventId) return;
    setLoadingSeats(true);
    fetchSoldSeats(eventId)
      .then(setSoldSeats)
      .finally(() => setLoadingSeats(false));
  }, [eventId]);

  async function handleReserve() {
    if (!eventId || selectedSeats.length === 0) {
      toast({ title: "Selecciona butacas", status: "warning", isClosable: true });
      return;
    }
    if (!buyer.trim()) {
      toast({ title: "Agrega nombre del comprador", status: "warning", isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/tickets/manual-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          seats: selectedSeats,
          userEmail: email.trim(),
          buyer,
        }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast({
          title: "Reservado exitosamente",
          description: email.trim()
            ? "Se enviaron los boletos por correo electrónico."
            : "Las butacas fueron asignadas correctamente.",
          status: "success",
          isClosable: true,
        });
        setSelectedSeats([]);
        setBuyer("");
        setEmail("");
        // Recargar los asientos ocupados tras reservar
        fetchSoldSeats(eventId).then(setSoldSeats);
      } else {
        toast({
          title: "Error",
          description: res.error || "No se pudo reservar.",
          status: "error",
          isClosable: true,
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Red o servidor.", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  // SSR: si no está autenticado, pide login
  if (!authed) {
    return (
      <Center minH="100vh" bg="gray.900">
        <AdminSsrLogin error={error} />
      </Center>
    );
  }

  // Panel de reserva manual
  return (
    <Box minH="100vh" bg="gray.900" py={10} px={2}>
      <Box maxW="100%" mx="auto" bg="gray.800" borderRadius="lg" p={8} color="white" boxShadow="xl">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Venta Manual (Efectivo)</Text>
        <Text>Evento: <b>{eventId}</b></Text>
        <Divider my={3} borderColor="gray.600" />
        <VStack spacing={4} align="start">
          <Text fontWeight="semibold">Selecciona las butacas:</Text>
          {loadingSeats ? (
            <Spinner color="cyan.400" />
          ) : (
            <SeatMap
              soldSeats={soldSeats}
              onSelectionChange={setSelectedSeats}
            />
          )}
          <Divider borderColor="gray.600" />
          <FormControl>
            <FormLabel>Nombre del comprador</FormLabel>
            <Input
              value={buyer}
              onChange={e => setBuyer(e.target.value)}
              bg="gray.700"
              color="white"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Correo (opcional)</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              bg="gray.700"
              color="white"
            />
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={handleReserve}
            isLoading={loading}
            w="full"
          >
            Registrar pago en efectivo
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
