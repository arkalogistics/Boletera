import { Center, Box, Text, Button, VStack, Alert, AlertIcon, Spinner } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { withAdminSessionSsr } from "../../../lib/withAdminSessionSsr";
import { AdminSsrLogin } from "../../../components/AdminSsrLogin";
import jsQR from "jsqr";
import React from "react";

// ---- Scanner puro como componente interno ----
function NativeQRScanner({ onResult }: { onResult: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  // Scan loop
  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        scanLoop();
      } catch (e: any) {
        setError("No se pudo acceder a la cámara. Da permisos o prueba otro navegador.");
      }
    };

    const scanLoop = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScanning(false);
            onResult(code.data);
            return;
          }
        }
      }
      animationId = requestAnimationFrame(scanLoop);
    };

    if (scanning) {
      setError(null);
      startCamera();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [scanning]);

  const reset = () => {
    setScanning(true);
    setError(null);
  };

  return (
    <VStack spacing={4}>
      {scanning && !error && (
        <>
          <video
            ref={videoRef}
            style={{ width: "100%", borderRadius: 12, background: "#111" }}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <Spinner color="cyan.400" />
          <Text fontSize="sm">Apunta el código QR...</Text>
        </>
      )}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text>{error}</Text>
          <Button mt={2} colorScheme="cyan" onClick={reset}>Reintentar</Button>
        </Alert>
      )}
    </VStack>
  );
}

// ---- Tu página Next.js protegida ----
export const getServerSideProps: GetServerSideProps = withAdminSessionSsr(async (ctx) => {
  const { id } = ctx.query;
  return { props: { authed: true, eventId: id || null } };
});

export default function ScanPage({ authed, error }: any) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [ticketInfo, setTicketInfo] = useState<any>(null);

  // Función llamada cuando detecta QR
  const handleQrResult = async (data: string) => {
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
        setMessage(`¡Acceso válido!${json.seatId ? "\nButaca: " + json.seatId : ""}`);
      } else {
        setStatus("error");
        setMessage(json.message || "Boleto inválido o ya registrado.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Error de red.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setTicketInfo(null);
  };

  // Si NO está autenticado, muestra el login SSR
  if (!authed) {
    return (
      <Center minH="100vh" bg="gray.900">
        <AdminSsrLogin error={error} />
      </Center>
    );
  }

  // Panel principal
  return (
    <Center minH="100vh" bg="gray.900">
      <Box bg="gray.800" color="white" p={6} borderRadius="xl" boxShadow="xl" maxW="sm" w="full">
        <Text fontWeight="bold" fontSize="2xl" mb={4}>
          Escanear boleto
        </Text>
        {status === "idle" && (
          <NativeQRScanner onResult={handleQrResult} />
        )}
        {status === "loading" && (
          <>
            <Spinner color="cyan.400" size="xl" />
            <Text>Validando...</Text>
          </>
        )}
        {(status === "success" || status === "error") && (
          <VStack spacing={4}>
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
            <Button colorScheme="cyan" onClick={reset}>
              Escanear otro
            </Button>
          </VStack>
        )}
      </Box>
    </Center>
  );
}
