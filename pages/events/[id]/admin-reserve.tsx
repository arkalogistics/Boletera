import { GetServerSideProps } from "next";
import { useState } from "react";
import { withAdminSessionSsr } from "../../../lib/withAdminSessionSsr";
import { AdminSsrLogin } from "../../../components/AdminSsrLogin";
import {
  Box, Button, Center, Divider, Flex, FormControl, FormLabel,
  Input, Text, VStack, useToast,
} from "@chakra-ui/react";

const ALL_SEATS = [
  "A-1", "A-2", "A-3", "B-1", "B-2", "C-1", "C-2", "D-1",
];

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

  function toggleSeat(seat: string) {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  }

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
      // Nuevo endpoint manual-create para tickets manuales (sin Stripe)
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

  // Si NO está autenticado, muestra el login SSR
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
      <Box maxW="md" mx="auto" bg="gray.800" borderRadius="lg" p={8} color="white" boxShadow="xl">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Venta Manual (Efectivo)</Text>
        <Text>Evento: <b>{eventId}</b></Text>
        <Divider my={3} borderColor="gray.600" />
        <VStack spacing={4} align="start">
          <Text fontWeight="semibold">Selecciona las butacas:</Text>
          <Flex wrap="wrap" gap={2}>
            {ALL_SEATS.map((seat) => (
              <Button
                key={seat}
                size="sm"
                colorScheme={selectedSeats.includes(seat) ? "cyan" : "gray"}
                variant={selectedSeats.includes(seat) ? "solid" : "outline"}
                onClick={() => toggleSeat(seat)}
                mb={1}
              >
                {seat}
              </Button>
            ))}
          </Flex>
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
