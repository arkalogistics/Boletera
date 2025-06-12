import { Center, Box, Text, Button, VStack, Alert, AlertIcon, Spinner } from "@chakra-ui/react";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { withAdminSessionSsr } from "../../../lib/withAdminSessionSsr";
import { AdminSsrLogin } from "../../../components/AdminSsrLogin";

// QRReader dinámico (sólo en cliente)
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export const getServerSideProps: GetServerSideProps = withAdminSessionSsr(async (ctx) => {
  const { id } = ctx.query;
  return { props: { authed: true, eventId: id || null } };
});

export default function ScanPage({ authed, error, eventId }: any) {
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const lastTokenRef = useRef<string | null>(null);

  const handleScan = async (data: string | null) => {
    if (!data || data === lastTokenRef.current) return;
    lastTokenRef.current = data;
    setResult(data);
    setStatus("loading");
    try {
      const res = await fetch(`/api/tickets/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data }),
      });
      const json = await res.json();
      setTicketInfo(json);
      if (res.ok && json.valid) {
        setStatus("success");
        setMessage(
          `¡Acceso válido!${json.seatId ? "\nButaca: " + json.seatId : ""}`
        );
      } else {
        setStatus("error");
        setMessage(json.message || "Boleto inválido o ya registrado.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Error de red.");
    }
  };

  const handleError = (err: any) => {
    setStatus("error");
    setMessage("No se pudo acceder a la cámara.");
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setMessage("");
    setTicketInfo(null);
    lastTokenRef.current = null;
  };

  // Si NO está autenticado, muestra el login SSR
  if (!authed) {
    return (
      <Center minH="100vh" bg="gray.900">
        <AdminSsrLogin error={error} />
      </Center>
    );
  }

  // Panel de escaneo QR
  return (
    <Center minH="100vh" bg="gray.900">
      <Box
        bg="gray.800"
        color="white"
        p={6}
        borderRadius="xl"
        boxShadow="xl"
        maxW="sm"
        w="full"
      >
        <Text fontWeight="bold" fontSize="2xl" mb={4}>
          Escanear boleto
        </Text>
        <VStack spacing={4}>
          {status === "idle" && (
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          )}
          {status === "loading" && (
            <>
              <Spinner color="cyan.400" size="xl" />
              <Text>Validando...</Text>
            </>
          )}
          {(status === "success" || status === "error") && (
            <Alert status={status === "success" ? "success" : "error"}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold" whiteSpace="pre-line">
                  {message}
                </Text>
                {ticketInfo?.ticket?.seat_id && (
                  <Text mt={2} fontSize="sm">
                    Asiento: {ticketInfo.ticket.seat_id}
                  </Text>
                )}
              </Box>
            </Alert>
          )}
          {(status === "success" || status === "error") && (
            <Button colorScheme="cyan" onClick={reset}>
              Escanear otro
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
