// components/Layout.tsx
import React, { ReactNode } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Container,
  Image,
  Link as ChakraLink,
  Text,
  VStack,
  HStack,
  Spacer,
  useColorModeValue,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  // dark theme
  const navBg = "rgba(0,0,0,0.7)";
  const footerBg = "#111";
  const linkColor = "gray.400";
  const linkHover = "cyan.300";
  const textColor = "whiteAlpha.900";

  return (
    <Flex direction="column" minH="100vh" bg="#000">
      {/* Navbar: just logo */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={1000}
        bg={navBg}
        backdropFilter="saturate(180%) blur(10px)"
        boxShadow="sm"
      >
        <Container
          maxW="container.xl"
          display="flex"
          alignItems="center"
          py={3}
        >
          <NextLink href="/" passHref>
            <ChakraLink display="flex" alignItems="center" mx="auto">
              <Image src="/logo.png" alt="Andro Logo" h="70px" />
            </ChakraLink>
          </NextLink>
        </Container>
      </Box>

      {/* Page content */}
      <Box flex="1">{children}</Box>

      {/* Footer: always shown */}
      <Box as="footer" bg={footerBg} py={10} color={textColor}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="flex-start"
          >
            <Box flex="1">
              <NextLink href="/" passHref>
                <ChakraLink display="flex" alignItems="center" mb={4}>
                  <Image src="/logo.png" alt="Andro Logo" h="100px" />
                </ChakraLink>
              </NextLink>
              <Text fontSize="sm" color="gray.500" maxW="sm">
                Andro es la plataforma líder en venta de boletos para tus
                eventos favoritos. Conecta, vive y comparte momentos únicos.
              </Text>
            </Box>

            <Spacer />

            <VStack
              align="flex-start"
              spacing={2}
              mt={{ base: 8, md: 0 }}
            >
              <NextLink href="/terms" passHref>
                <ChakraLink fontSize="sm" color={linkColor} _hover={{ color: linkHover }}>
                  Términos
                </ChakraLink>
              </NextLink>
              <NextLink href="/privacy" passHref>
                <ChakraLink fontSize="sm" color={linkColor} _hover={{ color: linkHover }}>
                  Privacidad
                </ChakraLink>
              </NextLink>
            </VStack>
          </Flex>
        </Container>
      </Box>
    </Flex>
  );
}
