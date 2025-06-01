// pages/events/[id]/checkout.tsx
import { useRouter } from "next/router";
import { useEffect, useState, ChangeEvent } from "react";
import {
  Button,
  Box,
  List,
  ListItem,
  Text,
  VStack,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";

// Importamos los estados de México
import { mxStates } from "../../../lib/mxStates";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  state: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { id, seats } = router.query; // id = eventId, seats = "A-1,B-2,C-3"
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Nuevos estados para los campos de contacto
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [stateMx, setStateMx] = useState<string>("");

  // 1) Parsear los asientos cuando la query esté lista
  useEffect(() => {
    if (!router.isReady) return;

    if (typeof seats === "string" && seats.length > 0) {
      const arr = seats.split(",");
      setSelectedSeats(arr);
    } else {
      setSelectedSeats([]);
    }
    setLoading(false);
  }, [router.isReady, seats]);

  // 2) Llamar al endpoint /api/checkout
  const handlePay = async () => {
    // Validar campos requeridos
    if (typeof id !== "string") return;
    if (selectedSeats.length === 0) {
      alert("Por favor selecciona al menos una butaca.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim() || !stateMx.trim()) {
      alert("Por favor completa todos los datos de contacto.");
      return;
    }

    const customer: CustomerInfo = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      state: stateMx.trim(),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          seats: selectedSeats,
          customer,
        }),
      });
      const { sessionUrl } = (await response.json()) as { sessionUrl?: string };
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        alert("Ocurrió un error al generar la sesión de pago.");
      }
    } catch (err) {
      console.error("Error al llamar a /api/checkout:", err);
      alert("Ocurrió un error de red.");
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="cyan.300" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack align="start" spacing={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Checkout
        </Text>

        <Box>
          <Text fontWeight="semibold" mb={2}>
            ID del Evento:
          </Text>
          <Text>{id}</Text>
        </Box>

        <Box>
          <Text fontWeight="semibold" mb={2}>
            Butacas seleccionadas:
          </Text>
          {selectedSeats.length > 0 ? (
            <List spacing={1}>
              {selectedSeats.map((s) => (
                <ListItem key={s}>
                  <Text>• {s}</Text>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text>No hay butacas seleccionadas.</Text>
          )}
        </Box>

        {/* ─── Campos de contacto ─── */}
        <VStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>Nombre completo</FormLabel>
            <Input
              placeholder="Tu nombre completo"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Teléfono</FormLabel>
            <Input
              type="tel"
              placeholder="5512345678"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Estado en México</FormLabel>
            <Select
              placeholder="Selecciona tu estado"
              value={stateMx}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setStateMx(e.target.value)
              }
            >
              {mxStates.map((st: string) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>

        <Button
          mt={4}
          colorScheme="green"
          size="lg"
          onClick={handlePay}
          isDisabled={
            selectedSeats.length === 0 ||
            !name.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !stateMx.trim()
          }
        >
          Ir a pagar
        </Button>
      </VStack>
    </Box>
  );
}
