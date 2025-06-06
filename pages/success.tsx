// pages/success.tsx (fragmento relevante)
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Box, Center, Spinner, Text, VStack, Button, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import QRCode from "react-qr-code";

type SessionResponse = { success: boolean; payment_status?: string; error?: string; };
type TicketResponse = { success: boolean; tokens?: string[]; error?: string; };

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState<"loading" | "paid" | "unpaid" | "error">("loading");
  const [ticketTokens, setTicketTokens] = useState<string[]>([]);

  useEffect(() => {
    if (!session_id || typeof session_id !== "string") return;
    (async () => {
      try {
        // 1) Verificar el estado de la sesión con /api/session
        const resp = await fetch(`/api/session?session_id=${session_id}`);
        const data: SessionResponse = await resp.json();
        if (!data.success || data.payment_status !== "paid") {
          setStatus(data.success ? "unpaid" : "error");
          return;
        }
        setStatus("paid");

        // 2) Marcar orden como pagada en Supabase
        await supabase.from("orders").update({ paid: true }).eq("stripe_session", session_id);

        // 3) Llamar a /api/tickets/create para generar X tokens (uno por asiento)
        const r2 = await fetch("/api/tickets/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session_id }),
        });
        const ticketData: TicketResponse = await r2.json();
        if (ticketData.success && ticketData.tokens) {
          setTicketTokens(ticketData.tokens);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [session_id]);

  if (status === "loading") {
    return (
      <Center h="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.400" thickness="4px" />
          <Text>Verificando tu pago…</Text>
        </VStack>
      </Center>
    );
  }

  if (status === "unpaid") {
    return (
      <Center h="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
        <VStack spacing={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            Pago no completado
          </Text>
          <Text>Tu pago no se procesó correctamente. Intenta de nuevo.</Text>
          <Link href="/" passHref>
            <Button colorScheme="cyan">Volver al inicio</Button>
          </Link>
        </VStack>
      </Center>
    );
  }

  if (status === "error") {
    return (
      <Center h="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
        <VStack spacing={4} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
            Ocurrió un error
          </Text>
          <Text>No pudimos verificar tu pago o generar los tickets.</Text>
          <Link href="/" passHref>
            <Button colorScheme="cyan">Volver al inicio</Button>
          </Link>
        </VStack>
      </Center>
    );
  }

  // Estado: "paid"
  return (
    <Center bg={useColorModeValue("gray.50", "gray.800")} py={{ base: 6, md: 12 }}>
      <VStack spacing={6} textAlign="center" p={{ base: 4, md: 8 }} bg={useColorModeValue("white", "gray.800")} borderRadius="lg" boxShadow="lg">
        <Text fontSize="3xl" fontWeight="bold" color="green.500">
          ¡Pago exitoso!
        </Text>
        <Text fontSize="lg">
          Gracias por tu compra. Por favor, muestra cada uno de estos códigos QR al ingresar al evento (o revisa tu correo, donde también los hemos enviado).
        </Text>

        {ticketTokens.length > 0 ? (
          <VStack spacing={6}>
            {ticketTokens.map((token) => (
              <Box key={token} p={4} bg={useColorModeValue("gray.100", "gray.700")} borderRadius="md">
                <QRCode
                  value={token}
                  size={200}
                  bgColor={useColorModeValue("#ffffff", "#1a202c")}
                  fgColor={useColorModeValue("#000000", "#ffffff")}
                />
                <Text mt={2} fontSize="sm" fontFamily="mono" wordBreak="break-all">
                  {token}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Spinner size="lg" color="cyan.400" />
        )}

        <Link href="/" passHref>
          <Button colorScheme="cyan">Volver al inicio</Button>
        </Link>
      </VStack>
    </Center>
  );
}
