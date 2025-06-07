// pages/events/[id]/index.tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { SeatMap } from "../../../components/SeatMap";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Button,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Props = {
  eventId: string;
  title: string;
  description: string;
  coverUrl: string | null;
  dateTime: string;
  place: string;
  soldSeats: string[];
};

export default function EventPage({
  eventId,
  title,
  description,
  coverUrl,
  dateTime,
  place,
  soldSeats,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "select">("info");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleStartSelection = () => setStep("select");
  const handleNext = () => {
    if (!selectedSeats.length) {
      alert("Por favor selecciona al menos una butaca.");
      return;
    }
    router.push({
      pathname: `/events/${eventId}/checkout`,
      query: { seats: selectedSeats.join(",") },
    });
  };

  const bg = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const headingColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("white", "gray.800");
  const btnGradient = useColorModeValue(
    "linear(to-r, teal.400, cyan.400)",
    "linear(to-r, teal.300, cyan.300)"
  );

  const formattedDate = new Date(dateTime).toLocaleString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      <Head>
        <title>{title} | Andro Eventos</title>
        <meta
          name="description"
          content={`Compra tus boletos para ${title} en ${place} el ${formattedDate}. ${description.slice(
            0,
            150
          )}…`}
        />
      </Head>

      {/* Hero */}
      <Box
        as="section"
        position="relative"
        h={{ base: "50vh", md: "70vh" }}
        backgroundImage={coverUrl ? `url(${coverUrl})` : undefined}
        backgroundSize="cover"
        backgroundPosition="center"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bgGradient="linear(to-b, rgba(0,0,0,0.6), rgba(0,0,0,0.2))"
        />
        <Container
          maxW="container.md"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
          pos="relative"
        >
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size={isMobile ? "2xl" : "4xl"}
              color="white"
              textShadow="0 0 10px rgba(0,0,0,0.7)"
            >
              {title}
            </Heading>
            <HStack
              spacing={6}
              color="whiteAlpha.800"
              fontSize={isMobile ? "sm" : "md"}
            >
              <HStack spacing={1}>
                <Icon as={FaMapMarkerAlt} />
                <Text>{place}</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaClock} />
                <Text>{formattedDate}</Text>
              </HStack>
            </HStack>
            <Button
              size="lg"
              bgGradient={btnGradient}
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={handleStartSelection}
            >
              Escoger asientos
            </Button>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={8} bg={bg}>
        {step === "info" && (
         <VStack spacing={8} align="stretch">
         <Box
           position="relative"
           bg={cardBg}
           p={{ base: 4, md: 8 }}
           borderRadius="lg"
           boxShadow="lg"
           _before={{
             content: '""',
             position: "absolute",
             top: 0,
             left: "50%",
             transform: "translateX(-50%)",
             width: "60px",
             height: "4px",
             bgGradient: "linear(to-r, teal.400, cyan.400)",
             borderRadius: "2px",
           }}
         >
           {/* Título de sección */}
           <Heading
             as="h2"
             size="md"
             mb={4}
             textAlign="center"
             color={headingColor}
           >
             Descripción del evento
           </Heading>
       
           {/* Divider decorativo */}
           <Divider
             mb={6}
             borderColor={useColorModeValue("gray.200", "gray.700")}
             width="40%"
             mx="auto"
           />
       
           {/* Texto con espacio y line-height */}
           <Text
             color={textColor}
             whiteSpace="pre-wrap"
             fontSize={{ base: "md", md: "lg" }}
             lineHeight="tall"
           >
             {description}
           </Text>
         </Box>
       </VStack>
       
        )}

        {step === "select" && (
          <VStack spacing={6}>
            <Heading size="lg" color={headingColor}>
              Selecciona tus asientos
            </Heading>
            <Box w="full" bg={cardBg} p={4} borderRadius="lg" boxShadow="md">
              <SeatMap
                soldSeats={soldSeats}
                onSelectionChange={(seats) => setSelectedSeats(seats)}
              />
            </Box>
            <Button
              size="lg"
              bgGradient={btnGradient}
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={handleNext}
              isDisabled={!selectedSeats.length}
            >
              Continuar al Checkout ({selectedSeats.length})
            </Button>
          </VStack>
        )}
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { id } = ctx.params!;
  if (!id || typeof id !== "string") return { notFound: true };

  // 1) Datos del evento
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("name, description, image_url, date, place")
    .eq("id", id)
    .single();
  if (eventError || !eventRow) {
    console.error("Error fetching event:", eventError);
    return { notFound: true };
  }

  // 2) Órdenes y tickets vendidos
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("event_id", id);
  const orderIds = orders?.map((o) => o.id) || [];

  let soldSeats: string[] = [];
  if (orderIds.length) {
    const { data: tickets } = await supabase
      .from("tickets")
      .select("seat_id")
      .in("order_id", orderIds);
    soldSeats = tickets?.map((t) => t.seat_id) || [];
  }

  return {
    props: {
      eventId: id,
      title: eventRow.name,
      description: eventRow.description,
      coverUrl: eventRow.image_url,
      dateTime: eventRow.date,
      place: eventRow.place,
      soldSeats,
    },
  };
};
