// pages/terms.tsx
import { Box, Heading, Text, VStack, List, ListItem, Divider } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";

export default function TermsAndConditions() {
  // Colores de fondo y texto según el modo (light/dark)
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const headingColor = useColorModeValue("gray.900", "gray.100");

  // Fecha de “Última actualización”
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>Términos y Condiciones — Andro</title>
        <meta
          name="description"
          content="Términos y Condiciones de uso de Andro. Conoce las reglas y responsabilidades al utilizar nuestra plataforma de venta de boletos."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <Box
        as="main"
        bg={bg}
        minH="100vh"
        py={{ base: 8, md: 12 }}
        px={{ base: 4, md: 8 }}
      >
        <Box
          maxW="container.md"
          mx="auto"
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="md"
          boxShadow="lg"
          p={{ base: 6, md: 10 }}
        >
          <VStack align="start" spacing={6}>
            <Heading as="h1" size="xl" color={headingColor}>
              Términos y Condiciones del Servicio — Andro
            </Heading>
            <Text fontSize="sm" color={textColor}>
              Última actualización: {formattedDate}
            </Text>

            <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />

            <VStack align="start" spacing={4} color={textColor} lineHeight="tall">
              <Text>
                Al utilizar <strong>Andro</strong>, aceptas cumplir con estos Términos y Condiciones. Te rogamos leerlos detenidamente antes de continuar.
              </Text>

              <Heading as="h2" size="lg">
                1. Uso del servicio
              </Heading>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Objetivo:</strong> Andro es una plataforma en línea para la venta de boletos de eventos.
                </ListItem>
                <ListItem>
                  <strong>Comportamiento:</strong> Te comprometes a utilizar la plataforma de forma legal, respetuosa y conforme a todas las leyes aplicables.
                </ListItem>
                <ListItem>
                  <strong>Acción prohibida:</strong> No publicarás contenido fraudulento ni harás uso de la plataforma para actividades ilegales.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                2. Compras y pagos
              </Heading>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Finalidad de la compra:</strong> Todas las compras de boletos se consideran finales y no reembolsables, excepto en los casos indicados por las políticas del organizador del evento.
                </ListItem>
                <ListItem>
                  <strong>Responsabilidad del organizador:</strong> Andro actúa únicamente como intermediario de venta. No somos responsables de la organización ni del desarrollo del evento, salvo que se indique lo contrario explícitamente.
                </ListItem>
                <ListItem>
                  <strong>Cancelaciones y reprogramaciones:</strong> Si el evento es cancelado o reprogramado, el reembolso o cambio de boleto estará sujeto a la política establecida por el organizador del evento.
                </ListItem>
                <ListItem>
                  <strong>Plataformas de pago:</strong> Las transacciones se procesan mediante servicios de pago de terceros (por ejemplo, Stripe, PayPal). Andro no almacena información completa de tarjetas.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                3. Cuentas de usuario
              </Heading>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Información verídica:</strong> Al registrarte o comprar, debes proporcionar datos personales correctos y actualizados.
                </ListItem>
                <ListItem>
                  <strong>Seguridad de la cuenta:</strong> Eres responsable de mantener la confidencialidad de tu contraseña y de cualquier actividad que ocurra bajo tu cuenta.
                </ListItem>
                <ListItem>
                  <strong>Prohibición de compartir:</strong> No debes compartir tu contraseña ni permitir que terceros utilicen tu cuenta.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                4. Responsabilidad
              </Heading>
              <Text>
                Andro no se hace responsable por daños, pérdidas o gastos indirectos, especiales, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de la plataforma, ni por la realización o cancelación de eventos.
              </Text>
              <Text>
                En ningún caso la responsabilidad total de Andro ante ti excederá el importe pagado por los boletos adquiridos a través de nuestra plataforma en la transacción que originó el reclamo.
              </Text>

              <Heading as="h2" size="lg">
                5. Propiedad intelectual
              </Heading>
              <Text>
                Todo el contenido, diseño, logotipos, marcas y software de Andro están protegidos por derechos de autor y otras leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado.
              </Text>

              <Heading as="h2" size="lg">
                6. Aviso de Cookies
              </Heading>
              <Text>
                Utilizamos cookies y tecnologías afines para mejorar tu experiencia en Andro. Algunas cookies son esenciales para el funcionamiento del sitio, mientras que otras se emplean con fines analíticos y publicitarios.
              </Text>
              <Text>
                Puedes administrar tus preferencias de cookies en cualquier momento desde la configuración de tu navegador o a través de la ventana emergente de cookies en nuestra plataforma.
              </Text>

              <Heading as="h2" size="lg">
                7. Modificaciones de los Términos
              </Heading>
              <Text>
                Nos reservamos el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento. Publicaremos la versión actualizada en esta misma página y cambiaremos la fecha de “Última actualización”. Te recomendamos revisar periódicamente para estar al tanto de posibles cambios.
              </Text>

              <Heading as="h2" size="lg">
                8. Legislación aplicable y jurisdicción
              </Heading>
              <Text>
                Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes del país donde operamos. Para cualquier controversia derivada de estos Términos, ambas partes se someten a la jurisdicción de los tribunales competentes en dicha localidad.
              </Text>

              <Heading as="h2" size="lg">
                9. Contacto
              </Heading>
              <Text>
                Si tienes preguntas o inquietudes sobre estos Términos y Condiciones, puedes contactarnos en:
              </Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  Correo: <Link color="cyan.500" href="mailto:soporte@andro.com">soporte@andro.com</Link>
                </ListItem>
                <ListItem>
                  Teléfono: <Link color="cyan.500" href="tel:+521234567890">+52 1 234 567 890</Link>
                </ListItem>
              </List>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </>
  );
}
