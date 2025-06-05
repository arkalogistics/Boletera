// pages/events/[id]/checkout.tsx
import { useRouter } from "next/router";
import { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  VStack,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { id, seats } = router.query; // id = eventId, seats = "A-1,B-2,C-3"
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof seats === "string" && seats.length > 0) {
      setSelectedSeats(seats.split(","));
    } else {
      setSelectedSeats([]);
    }
    setLoading(false);
  }, [router.isReady, seats]);

  const handlePay = async () => {
    if (typeof id !== "string") return;
    if (selectedSeats.length === 0) {
      alert("Por favor selecciona al menos una butaca.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Por favor ingresa un correo válido.");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          seats: selectedSeats,
          userEmail: email.trim(),
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

  const getCategory = (seatId: string) => {
    const fila = seatId.split("-")[0].toUpperCase();
    if (fila === "A") return "VIP";
    if (fila === "B" || fila === "C") return "PREFERENTE";
    return "GENERAL";
  };

  const getCategoryColorScheme = (category: string) => {
    if (category === "VIP") return "yellow";
    if (category === "PREFERENTE") return "blue";
    return "gray";
  };

  // Precios de ejemplo (puedes omitir si tu backend los calcula)
  const pricePerCategory: Record<string, number> = {
    VIP: 150,
    PREFERENTE: 100,
    GENERAL: 60,
  };
  const totalAmount = selectedSeats.reduce((acc, seat) => {
    const cat = getCategory(seat);
    return acc + (pricePerCategory[cat] || 0);
  }, 0);

  if (loading) {
    return (
      <Center h="60vh" bg={useColorModeValue("gray.50", "gray.800")}>
        <Spinner size="xl" color="cyan.400" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box
      as="main"
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="100vh"
      py={{ base: 6, md: 12 }}
      px={{ base: 4, md: 8 }}
    >
      <Flex
        direction="column"
        maxW="container.lg"
        mx="auto"
        bg={useColorModeValue("white", "gray.800")}
        borderRadius="lg"
        boxShadow="lg"
        overflow="hidden"
      >
        {/* Header */}
        <Box bg={useColorModeValue("cyan.500", "cyan.700")} py={6} px={8}>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="white"
          >
            Checkout
          </Text>
          <Text color="white" mt={1}>
            Evento: <Text as="span" fontWeight="semibold">{id}</Text>
          </Text>
        </Box>

        {/* Contenido principal */}
        <VStack spacing={4} p={{ base: 6, md: 8 }} align="start">
          {/* Resumen de butacas */}
          <Text fontSize="lg" fontWeight="semibold">
            Butacas seleccionadas:
          </Text>
          {selectedSeats.length > 0 ? (
            <VStack
              align="start"
              spacing={2}
              bg={useColorModeValue("gray.50", "gray.700")}
              p={4}
              borderRadius="md"
              w="full"
            >
              {selectedSeats.map((s) => {
                const cat = getCategory(s);
                return (
                  <Flex
                    key={s}
                    w="full"
                    justify="space-between"
                    align="center"
                  >
                    <Text color={useColorModeValue("gray.800", "gray.100")}>
                      {s}
                    </Text>
                    <Badge
                      colorScheme={getCategoryColorScheme(cat)}
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {cat}
                    </Badge>
                    <Text fontWeight="bold">
                      ${pricePerCategory[cat] || 0}
                    </Text>
                  </Flex>
                );
              })}
              <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />
              <Flex w="full" justify="space-between" pt={2}>
                <Text fontWeight="semibold">Total:</Text>
                <Text fontSize="lg" fontWeight="bold">
                  ${totalAmount}
                </Text>
              </Flex>
            </VStack>
          ) : (
            <Text>No hay butacas seleccionadas.</Text>
          )}

          {/* Formulario de correo y botón */}
          <Box w="full">
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Información de contacto
            </Text>
            <VStack as="form" spacing={4} w="full" onSubmit={(e) => {
                e.preventDefault();
                handlePay();
              }}>
              <FormControl isRequired>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  bg={useColorModeValue("white", "gray.700")}
                  borderColor={useColorModeValue("gray.300", "gray.600")}
                  _focus={{
                    borderColor: "cyan.400",
                    boxShadow: "0 0 0 1px #38B2AC",
                  }}
                />
              </FormControl>
              <Button
                type="submit"
                w="full"
                size="lg"
                bgGradient="linear(to-r, cyan.400, teal.400)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, cyan.500, teal.500)" }}
                isDisabled={selectedSeats.length === 0 || !email.trim()}
              >
                Ir a pagar
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
}
