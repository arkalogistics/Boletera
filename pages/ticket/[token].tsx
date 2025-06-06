// pages/ticket/[token].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "react-qr-code";
import {
  Box,
  Center,
  Text,
  VStack,
  Button,
  Grid,
  GridItem,
  Divider,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";

type TicketData = {
  valid: true;
  token: string;
  seatId: string;       // ej. "B-8"
  eventTitle: string;   // ej. "Concierto de Jazz"
  eventVenue: string;   // ej. "Auditorio Nacional"
  eventDateTime: string;// ej. "2024-05-22T18:31:00Z"
};

type Props = {
  loading: boolean;
  errorMessage?: string;
  ticketData?: TicketData;
};

function TicketPage({ loading, errorMessage, ticketData }: Props) {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.200");

  // Mientras se carga, mostramos spinner
  if (loading) {
    return (
      <Center bg={bg} minH="100vh">
        <Spinner size="xl" color="cyan.400" thickness="4px" />
      </Center>
    );
  }

  // Si ticketData es undefined (o valid === false), mostramos pantalla de boleto inválido
  if (!ticketData || !ticketData.valid) {
    return (
      <Center bg={bg} minH="100vh" p={4}>
        <Box
          maxW="sm"
          w="full"
          bg={cardBg}
          borderRadius="lg"
          boxShadow="xl"
          overflow="hidden"
        >
          <VStack spacing={0} align="stretch">
            <Box bg="cyan.600" py={4} px={6} textAlign="center">
              <Text fontSize="lg" fontWeight="bold" color="white">
                Boleto inválido
              </Text>
            </Box>
            <Box p={6} textAlign="center">
              <Text fontSize="lg" color="red.500" fontWeight="bold">
                🚫 Boleto inválido
              </Text>
              <Text mt={2} fontSize="sm" color={textColor}>
                {errorMessage ?? "No se encontró la información de tu boleto o ya fue usado."}
              </Text>
            </Box>
            <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />
            <Box p={4} textAlign="center">
              <Link href="/" passHref>
                <Button colorScheme="cyan" w="full">
                  Regresar
                </Button>
              </Link>
            </Box>
          </VStack>
        </Box>
      </Center>
    );
  }

  // Si llegamos aquí, ticketData.valid === true
  const { seatId, eventTitle, eventVenue, eventDateTime, token } = ticketData;

  // Desglose de seatId en sección, fila y número
  const [section, row, seatNumber] = seatId.split("-");

  // Formateo de fecha al español
  let formattedDate = "";
  if (eventDateTime) {
    const d = new Date(eventDateTime);
    formattedDate = d.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Center bg={bg} minH="100vh" py={8} px={4}>
      <Box
        maxW="sm"
        w="full"
        bg={cardBg}
        borderRadius="lg"
        boxShadow="xl"
        overflow="hidden"
      >
        <VStack spacing={0} align="stretch">
          {/* —— Header del ticket —— */}
          <Box bg="cyan.600" py={4} px={6} textAlign="center">
            <Text fontSize="lg" fontWeight="bold" color="white">
              {eventTitle}
            </Text>
          </Box>

          {/* —— Cuerpo con datos del evento y asiento —— */}
          <Box p={4}>
            <VStack spacing={2} align="start">
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="semibold">
                  📍 Lugar:
                </Text>{" "}
                {eventVenue}
              </Text>
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="semibold">
                  📅 Fecha y hora:
                </Text>{" "}
                {formattedDate}
              </Text>
            </VStack>

            <Divider
              my={4}
              borderColor={useColorModeValue("gray.200", "gray.600")}
            />

            <Grid templateColumns="1fr 1fr 1fr" gap={2} textAlign="center">
              <GridItem>
                <Text
                  fontSize="xs"
                  color={textColor}
                  textTransform="uppercase"
                >
                  Sección
                </Text>
                <Text fontSize="md" fontWeight="bold" color={textColor}>
                  {section}
                </Text>
              </GridItem>
              <GridItem>
                <Text
                  fontSize="xs"
                  color={textColor}
                  textTransform="uppercase"
                >
                  Fila
                </Text>
                <Text fontSize="md" fontWeight="bold" color={textColor}>
                  {row}
                </Text>
              </GridItem>
              <GridItem>
                <Text
                  fontSize="xs"
                  color={textColor}
                  textTransform="uppercase"
                >
                  Asiento
                </Text>
                <Text fontSize="md" fontWeight="bold" color={textColor}>
                  {seatNumber}
                </Text>
              </GridItem>
            </Grid>

            <Divider
              my={4}
              borderColor={useColorModeValue("gray.200", "gray.600")}
            />

            {/* —— Código QR —— */}
            <Center mb={2}>
              <Box
                bg={useColorModeValue("gray.100", "gray.700")}
                p={2}
                borderRadius="md"
              >
                <QRCode
                  value={`${process.env.NEXT_PUBLIC_APP_URL}/ticket/${token}`}
                  size={150}
                  bgColor={cardBg}
                  fgColor={textColor}
                />
              </Box>
            </Center>
            <Text
              mt={2}
              fontSize="xs"
              color={useColorModeValue("gray.500", "gray.400")}
              textAlign="center"
            >
              Escanea este QR en la taquilla para validar tu entrada
            </Text>
          </Box>

          <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />

          <Box p={4} textAlign="center">
            <Link href="/" passHref>
              <Button colorScheme="cyan" w="full">
                Volver al inicio
              </Button>
            </Link>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
}
// pages/ticket/[token].tsx (continúa abajo)

export const TicketWrapper: React.FC = () => {
    const router = useRouter();
    const { token } = router.query;
  
    const [state, setState] = useState<{
      loading: boolean;
      ticketData?: TicketData;
      errorMessage?: string;
    }>({
      loading: true,
      ticketData: undefined,
      errorMessage: undefined,
    });
  
    useEffect(() => {
      if (!router.isReady) return;
  
      if (!token || typeof token !== "string") {
        setState({
          loading: false,
          ticketData: undefined,
          errorMessage: "Token inválido o faltante en la URL.",
        });
        return;
      }
  
      fetch(`/api/tickets/${token}`)
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json();
            throw new Error(body.message || "Error desconocido al validar boleto.");
          }
          return res.json() as Promise<TicketData>;
        })
        .then((json) => {
          setState({
            loading: false,
            ticketData: json,
            errorMessage: undefined,
          });
        })
        .catch((err: any) => {
          setState({
            loading: false,
            ticketData: undefined,
            errorMessage: err.message || "Error validando boleto.",
          });
        });
    }, [router.isReady, token]);
  
    return (
      <TicketPage
        loading={state.loading}
        ticketData={state.ticketData}
        errorMessage={state.errorMessage}
      />
    );
  };
  
  export default TicketWrapper;
  