// pages/admin/events/new.tsx
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Center,
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { supabase } from '../../../lib/supabaseClient';

interface Venue {
  id: string;
}

const NewEventPage: NextPage = () => {
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [venueId, setVenueId] = useState<string | null>(null);
  const [loadingVenue, setLoadingVenue] = useState<boolean>(true);
  const router = useRouter();

  // 1) Al montar, obtenemos el único venue
  useEffect(() => {
    supabase
      .from('venues')
      .select('id')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching venue:', error.message);
        } else if (data) {
          // casteamos data a Venue
          setVenueId((data as Venue).id);
        }
        setLoadingVenue(false);
      });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!venueId) return;

    // 2) Insertamos el evento
    const { data, error } = await supabase
      .from('events')
      .insert([{ name, date, venue_id: venueId }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creando evento:', error.message);
      return;
    }

    // casteamos el resultado a { id: string }
    const newEvent = data as { id: string };
    await router.push(`/admin/events/${newEvent.id}/seats`);
  };

  if (loadingVenue) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!venueId) {
    return (
      <Box p={6}>
        <Text color="red.500">No se encontró ningún venue en la base de datos.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4} isRequired>
          <FormLabel>Nombre del evento</FormLabel>
          <Input
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4} isRequired>
          <FormLabel>Fecha y hora</FormLabel>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal" isDisabled={!name || !date}>
          Crear evento
        </Button>
      </form>
    </Box>
  );
};

export default NewEventPage;
