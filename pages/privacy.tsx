// pages/privacy.tsx
import { Box, Heading, Text, VStack, List, ListItem, Link, Divider } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import Head from "next/head";

export default function PrivacyPolicy() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const headingColor = useColorModeValue("gray.900", "gray.100");

  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>Política de Privacidad — Andro</title>
        <meta
          name="description"
          content="Política de Privacidad de Andro. Conoce cómo recopilamos, usamos y protegemos tu información personal al comprar boletos y navegar en nuestra plataforma."
        />
        <meta name="robots" content="index, follow" />
      </Head>
      <Box as="main" bg={bg} minH="100vh" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }}>
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
              Política de Privacidad — Andro
            </Heading>
            <Text fontSize="sm" color={textColor}>
              Última actualización: {formattedDate}
            </Text>

            <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />

            <VStack align="start" spacing={4} color={textColor} lineHeight="tall">
              <Text>
                En <strong>Andro</strong>, valoramos tu privacidad y nos comprometemos a proteger la
                información personal que nos proporcionas. Esta política describe cómo recopilamos,
                usamos y protegemos tus datos cuando visitas nuestra plataforma y compras boletos
                para eventos.
              </Text>

              <Heading as="h2" size="lg">
                1. Información que recopilamos
              </Heading>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Datos personales:</strong> Nombre completo, correo electrónico, número
                  telefónico y cualquier otro dato que ingreses voluntariamente al registrarte o
                  completar tu perfil.
                </ListItem>
                <ListItem>
                  <strong>Datos de pago:</strong> Información necesaria para procesar tu compra a
                  través de plataformas de pago de terceros como Stripe o PayPal. Nosotros no
                  almacenamos tu número de tarjeta; los procesadores de pago se encargan de
                  gestionar esa información.
                </ListItem>
                <ListItem>
                  <strong>Datos de navegación y uso:</strong> Cookies, dirección IP, tipo de
                  navegador, páginas consultadas, tiempo de permanencia y demás datos recopilados
                  automáticamente para mejorar tu experiencia.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                2. Uso de tu información
              </Heading>
              <Text>Utilizamos tus datos con los siguientes fines:</Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Procesar y confirmar tus compras de boletos:</strong> Verificar disponibilidad,
                  generar tu orden y enviarte las confirmaciones por correo.
                </ListItem>
                <ListItem>
                  <strong>Enviar notificaciones y recordatorios:</strong> Información sobre cambios en
                  el evento, recordatorios de fecha y hora, invitaciones a futuros eventos,
                  promociones y encuestas de satisfacción.
                </ListItem>
                <ListItem>
                  <strong>Mejorar tu experiencia:</strong> Analizamos datos de navegación para optimizar
                  el funcionamiento de Andro, personalizar contenido y ofrecer recomendaciones
                  relevantes.
                </ListItem>
                <ListItem>
                  <strong>Cumplir obligaciones legales:</strong> Guardar registros de transacciones
                  para efectos fiscales, atender pedidos de autoridades competentes y asegurarnos
                  de operar conforme a la normativa aplicable.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                3. Compartición de datos
              </Heading>
              <Text>En Andro, tu información se comparte únicamente en los siguientes casos:</Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Proveedores de servicios externos:</strong> Plataformas de pago (Stripe,
                  PayPal), servicios de correo electrónico, alojamiento web y herramientas de
                  análisis (por ejemplo, Google Analytics). Solamente compartimos los datos
                  estrictamente necesarios para brindar el servicio.
                </ListItem>
                <ListItem>
                  <strong>Obligaciones legales:</strong> Cuando sea requerido por ley, mandato judicial
                  o autoridad gubernamental, divulgaremos tu información para cumplir con
                  obligaciones legales o proteger derechos de terceros.
                </ListItem>
                <ListItem>
                  <strong>Sin venta de datos:</strong> Nunca venderemos, alquilaremos ni cederemos tus
                  datos personales a terceros con fines comerciales sin tu consentimiento expreso.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                4. Seguridad de la información
              </Heading>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Cifrado:</strong> Toda la información sensible (por ejemplo, datos de pago)
                  se transmite a través de conexiones cifradas (HTTPS/TLS).
                </ListItem>
                <ListItem>
                  <strong>Controles internos:</strong> Acceso restringido a bases de datos y sistemas
                  solo al personal autorizado. Políticas de contraseñas robustas y autenticación de
                  dos factores para nuestro equipo.
                </ListItem>
                <ListItem>
                  <strong>Copias de seguridad:</strong> Realizamos respaldos periódicos para evitar la
                  pérdida de datos y garantizar la continuidad del servicio.
                </ListItem>
                <ListItem>
                  <strong>Actualizaciones constantes:</strong> Mantenemos actualizados nuestros sistemas
                  y bibliotecas para protegernos contra vulnerabilidades conocidas.
                </ListItem>
              </List>

              <Heading as="h2" size="lg">
                5. Cookies y tecnologías afines
              </Heading>
              <Text>
                Utilizamos cookies y tecnologías similares para recopilar datos de navegación y
                preferencias. Las cookies nos permiten:
              </Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Recordar tu sesión:</strong> Facilitar el inicio de sesión y mantener tu
                  sesión activa mientras navegas.
                </ListItem>
                <ListItem>
                  <strong>Analizar el uso:</strong> Conocer cómo interactúas con la plataforma para
                  optimizarla.
                </ListItem>
                <ListItem>
                  <strong>Publicidad personalizada:</strong> Podemos mostrarte anuncios relevantes
                  basados en tu comportamiento en el sitio (siempre con tu consentimiento).
                </ListItem>
              </List>
              <Text>
                Puedes configurar tu navegador para deshabilitar cookies o solicitar una alerta
                cuando se envíen. Sin embargo, algunas funciones de Andro podrían no funcionar
                correctamente si deshabilitas todas las cookies.
              </Text>

              <Heading as="h2" size="lg">
                6. Tus derechos y opciones
              </Heading>
              <Text>Como usuario de Andro, tienes derecho a:</Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Acceder:</strong> Solicitar copia de los datos personales que hemos
                  recopilado sobre ti.
                </ListItem>
                <ListItem>
                  <strong>Rectificar:</strong> Corregir cualquier dato inexacto o incompleto.
                </ListItem>
                <ListItem>
                  <strong>Eliminar:</strong> Solicitar la eliminación de tu información personal (salvo
                  que exista una obligación legal de conservarla).
                </ListItem>
                <ListItem>
                  <strong>Oponerte al tratamiento:</strong> Indicar que no deseas que utilicemos tus
                  datos con fines de marketing directo.
                </ListItem>
                <ListItem>
                  <strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y
                  legible para transferirlos a otro proveedor de servicios.
                </ListItem>
                <ListItem>
                  <strong>Retirar tu consentimiento:</strong> Si en algún momento diste tu consentimiento
                  para un tratamiento específico (por ejemplo, recibir boletines), puedes revocarlo
                  sin afectar la licitud del uso previo de tus datos.
                </ListItem>
              </List>
              <Text>
                Para ejercer cualquiera de estos derechos, contáctanos a{" "}
                <Link href="mailto:privacidad@andro.com" color="teal.500">
                  privacidad@andro.com
                </Link>
                . Responderemos tu solicitud en un plazo máximo de 30 días.
              </Text>

              <Heading as="h2" size="lg">
                7. Conservación de datos
              </Heading>
              <Text>
                Conservamos tu información personal solo durante el tiempo necesario para cumplir con los
                fines para los que fue recopilada. Una vez cumplido ese propósito, o cuando solicites la
                eliminación, borraremos o anonimizaremos tus datos, salvo cuando exista una obligación
                legal que nos impida hacerlo (por ejemplo, requisitos fiscales).
              </Text>

              <Heading as="h2" size="lg">
                8. Enlaces a sitios de terceros
              </Heading>
              <Text>
                Andro puede contener enlaces a sitios web de terceros (por ejemplo, redes sociales o
                páginas de patrocinadores). No nos hacemos responsables de las prácticas de privacidad ni
                del contenido de esos sitios. Te recomendamos revisar las políticas de privacidad de
                cada sitio externo antes de proporcionarles información personal.
              </Text>

              <Heading as="h2" size="lg">
                9. Cambios a esta política
              </Heading>
              <Text>
                Podremos actualizar esta Política de Privacidad periódicamente para reflejar cambios
                en nuestras prácticas o requerimientos legales. Publicaremos la versión revisada en
                esta misma página con la “Última actualización” al inicio. Te recomendamos revisarla
                regularmente.
              </Text>

              <Heading as="h2" size="lg">
                10. Contacto
              </Heading>
              <Text>
                Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, contáctanos
                en:
              </Text>
              <List spacing={2} pl={4} styleType="disc">
                <ListItem>
                  <strong>Email:</strong>{" "}
                  <Link href="mailto:privacidad@andro.com" color="teal.500">
                    privacidad@andro.com
                  </Link>
                </ListItem>
                <ListItem>
                  <strong>Dirección:</strong> Calle Ejemplo 123, Colonia Centro, Ciudad, País.
                </ListItem>
                <ListItem>
                  <strong>Teléfono:</strong> +52 55 1234 5678
                </ListItem>
              </List>
              <Text>Te responderemos a la brevedad posible.</Text>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </>
  );
}
