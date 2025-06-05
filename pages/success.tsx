// pages/success.tsx (resumen)
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Box, Center, Spinner, Text, VStack, Button, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import QRCode from "react-qr-code";

type SessionResponse = { success: boolean; payment_status?: string; error?: string; };
type TicketResponse = { success: boolean; token?: string; error?: string; };

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState<"loading" | "paid" | "unpaid" | "error">("loading");
  const [ticketToken, setTicketToken] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id || typeof session_id !== "string") return;
    (async () => {
      try {
        // 1) Verificar el status de pago desde /api/session
        const resp = await fetch(`/api/session?session_id=${session_id}`);
        const data: SessionResponse = await resp.json();
        if (!data.success) { setStatus("error"); return; }
        if (data.payment_status === "paid") {
          setStatus("paid");
          // 2) Marcar la orden como pagada en Supabase
          await supabase.from("orders").update({ paid: true }).eq("stripe_session", session_id);
          // 3) Crear o recuperar ticket
          const response = await fetch("/api/tickets/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: session_id }),
          });
          const ticketData: TicketResponse = await response.json();
          if (ticketData.success && ticketData.token) {
            setTicketToken(ticketData.token);
          } else {
            setStatus("error");
          }
        } else {
          setStatus("unpaid");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [session_id]);

  // ... (renderizado igual que antes)
  if (status === "loading") return /* Spinner */;
  if (status === "unpaid") return /* Mensaje sin pago */;
  if (status === "error") return /* Mensaje de error */;

  // status === "paid":
  return (
    <Center bg={useColorModeValue("gray.50","gray.800")} py={{ base:6, md:12 }}>
      <VStack spacing={6} textAlign="center" p={{ base:4, md:8 }} bg={useColorModeValue("white","gray.800")} borderRadius="lg" boxShadow="lg">
        <Text fontSize="3xl" fontWeight="bold" color="green.500">¡Pago exitoso!</Text>
        <Text fontSize="lg">Gracias por tu compra. Te hemos enviado el código QR a tu correo. Además, lo puedes ver a continuación:</Text>
        {ticketToken ? (
          <Box p={4} bg={useColorModeValue("gray.100","gray.700")} borderRadius="md">
            <QRCode value={ticketToken} size={256} bgColor={useColorModeValue("#ffffff","#1a202c")} fgColor={useColorModeValue("#000000","#ffffff")}/>
          </Box>
        ) : (
          <Spinner size="lg" color="cyan.400" />
        )}
        <Text fontSize="sm" color={useColorModeValue("gray.600","gray.400")} wordBreak="break-all">
          Tu token de entrada:<br/>
          <Text as="span" fontFamily="mono">{ticketToken}</Text>
        </Text>
        <Link href="/" passHref>
          <Button colorScheme="cyan">Volver al inicio</Button>
        </Link>
      </VStack>
    </Center>
  );
}
