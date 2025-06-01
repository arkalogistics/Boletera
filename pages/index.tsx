// pages/index.tsx
import type { NextPage, GetServerSideProps } from "next";
import NextLink from "next/link";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  LinkBox,
  LinkOverlay,
  Spinner,
  Center,
  Button,
  VStack,
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";

interface Event {
  id: string;
  name: string;
  date: string;
}

interface HomePageProps {
  events: Event[];
}

/**
 * Fetch all events (id, name, date) ordered by date ascending.
 */
export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const { data, error } = await supabase
    .from<"events", Event>("events")
    .select("id, name, date")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error.message);
    return { props: { events: [] } };
  }

  return {
    props: {
      events: data ?? [],
    },
  };
};

const HomePage: NextPage<HomePageProps> = ({ events }) => {
  return (
    <Box>
      {/* ─────────────────────────────────────────────────────── Hero Section ─────────────────────────────────────────────────────── */}
      <Box
        as="section"
        w="100%"
        h={{ base: "60vh", md: "80vh" }}
        position="relative"
        backgroundImage="url('/images/hero-bg.jpg')"
        backgroundSize="cover"
        backgroundPosition="center center"
      >
        {/* Dark overlay to improve text contrast */}
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0, 0, 0, 0.6)"
        />
        <VStack
          position="relative"
          zIndex={1}
          h="100%"
          w="100%"
          justify="center"
          align="center"
          spacing={4}
          px={4}
          textAlign="center"
        >
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            color="cyan.300"
            fontWeight="extrabold"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            BOLETERA
          </Heading>
          <NextLink href="#events" passHref>
            <Button
              as="a"
              bg="cyan.300"
              color="black"
              _hover={{ bg: "cyan.400" }}
              size="lg"
            >
              Próximos Eventos
            </Button>
          </NextLink>
        </VStack>
      </Box>

      {/* ───────────────────────────────────────────────────────── Upcoming Events ───────────────────────────────────────────────────────── */}
      <Box as="section" id="events" py={10} px={{ base: 4, md: 8 }}>
        <Heading mb={6} color="white" textAlign="center">
          Próximos Eventos
        </Heading>

        {events.length === 0 ? (
          <Center h="40vh">
            <Spinner size="xl" color="cyan.300" />
          </Center>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            mb={8}
          >
            {events.map((evt) => {
              const eventDate = new Date(evt.date).toLocaleString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <LinkBox
                  as="article"
                  key={evt.id}
                  p={4}
                  bg="gray.800"
                  borderRadius="md"
                  _hover={{ shadow: "lg" }}
                  transition="box-shadow 0.2s"
                >
                  <Heading size="md" mb={2} color="white">
                    <LinkOverlay href={`/events/${evt.id}`}>
                      {evt.name}
                    </LinkOverlay>
                  </Heading>
                  <Text fontSize="sm" color="gray.400">
                    {eventDate}
                  </Text>
                </LinkBox>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
