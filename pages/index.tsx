// pages/index.tsx
import type { NextPage, GetServerSideProps } from 'next';
import NextLink from 'next/link';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  LinkBox,
  LinkOverlay,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabaseClient';

interface Event {
  id: string;
  name: string;
  date: string;
}

interface HomePageProps {
  events: Event[];
}

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  const { data, error } = await supabase
    .from<'events', Event>('events')
    .select('id, name, date')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error.message);
    return { props: { events: [] } };
  }

  return {
    props: {
      events: data ?? [],
    },
  };
};

const HomePage: NextPage<HomePageProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Próximos Eventos</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {events.map((evt) => {
          const eventDate = new Date(evt.date).toLocaleString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <LinkBox
              as="article"
              key={evt.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ shadow: 'md' }}
            >
              <Heading size="md" mb={2}>
                <LinkOverlay href={`/events/${evt.id}`}>{evt.name}</LinkOverlay>
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {eventDate}
              </Text>
            </LinkBox>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default HomePage;
