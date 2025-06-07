// pages/index.tsx
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
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
  Image,
  VStack,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { supabase } from "../lib/supabaseClient";

interface Event {
  id: string;
  name: string;
  date: string;
  image_url: string | null;
}

interface HomePageProps {
  events: Event[];
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const { data, error } = await supabase
    .from<"events", Event>("events")
    .select("id, name, date, image_url")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error.message);
  }

  return {
    props: {
      events: data ?? [],
    },
  };
};

const HomePage: NextPage<HomePageProps> = ({ events }) => {
  const cardBg = useColorModeValue("gray.800", "gray.700");
  const headingColor = useColorModeValue("white", "whiteAlpha.900");
  const textColor = useColorModeValue("gray.400", "gray.300");
  const siteUrl = "https://andra.lat";

  // Build JSON-LD structured data
  const itemList = events.map((evt, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Event",
      name: evt.name,
      startDate: new Date(evt.date).toISOString(),
      url: `${siteUrl}/events/${evt.id}`
    }
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: itemList
  };

  return (
    <>
      <Head>
        <title>Andra Eventos | Compra Boletos Hoy</title>
        <meta
          name="description"
          content="Descubre y compra tus boletos para los mejores eventos en Andra. Conciertos, teatro y más. ¡Entradas disponibles hoy!"
        />
        <meta
          name="keywords"
          content="boletos eventos, compra entradas, conciertos, teatro, Andra Eventos"
        />
        <link rel="canonical" href={siteUrl + "/"} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Andra Eventos | Compra Boletos Hoy" />
        <meta
          property="og:description"
          content="Descubre y compra tus boletos para los mejores eventos en Andra. ¡Entradas disponibles hoy!"
        />
        <meta property="og:url" content={siteUrl + "/"} />
        <meta property="og:image" content={siteUrl + "/hero.png"} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Andra Eventos | Compra Boletos Hoy" />
        <meta
          name="twitter:description"
          content="Descubre y compra tus boletos para los mejores eventos en Andra."
        />
        <meta name="twitter:image" content={siteUrl + "/hero.png"} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          // dangerouslySetInnerHTML is necessary for JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <Box as="main">
        {/* Hero */}
        <Box
          as="section"
          role="banner"
          w="100%"
          h={{ base: "50vh", md: "80vh" }}
          position="relative"
          backgroundImage="url('/hero.png')"
          backgroundSize="cover"
          backgroundPosition="center"
        >
          <Box
            position="absolute"
            inset={0}
            bg="rgba(0,0,0,0.6)"
          />
          <VStack
            position="relative"
            zIndex={1}
            h="100%"
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
              Andra Eventos
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.800">
              Compra tus boletos en segundos para los mejores shows.
            </Text>
          </VStack>
        </Box>

        {/* Upcoming Events */}
        <Container as="section" id="events" maxW="container.xl" py={12}>
          <Heading
            as="h2"
            size="xl"
            mb={8}
            color={headingColor}
            textAlign="center"
          >
            Próximos Eventos
          </Heading>

          {events.length === 0 ? (
            <Center h="40vh">
              <Spinner size="xl" color="cyan.300" />
            </Center>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
            >
              {events.map((evt) => {
                const formattedDate = new Date(evt.date).toLocaleString(
                  "es-MX",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <LinkBox
                    as="article"
                    key={evt.id}
                    bg={cardBg}
                    borderRadius="md"
                    overflow="hidden"
                    role="group"
                    _hover={{ shadow: "lg" }}
                    transition="box-shadow 0.2s"
                  >
                   
                    {evt.image_url && (
                        <NextLink href={`/events/${evt.id}`} passHref>
                      <Image
                        src={evt.image_url}
                        alt={`Portada de ${evt.name}`}
                        objectFit="cover"
                        w="100%"
                        h="500px"
                        loading="lazy"
                      />
                      </NextLink>
                    )}
                    
                    <Box p={6}>
                      <Heading size="md" mb={2} color={textColor}>
                        <NextLink href={`/events/${evt.id}`} passHref>
                          <LinkOverlay>{evt.name}</LinkOverlay>
                        </NextLink>
                      </Heading>
                      <Text fontSize="sm" color={textColor}>
                        {formattedDate}
                      </Text>
                    </Box>
                  </LinkBox>
                );
              })}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
