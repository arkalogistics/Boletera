import { Box, Button, VStack, Text, Alert, AlertIcon } from "@chakra-ui/react";

export function AdminSsrLogin({ error }: { error?: string }) {
  return (
    <Box
      bg="gray.800"
      color="white"
      p={8}
      borderRadius="xl"
      boxShadow="xl"
      maxW="xs"
      w="full"
    >
      <Text fontWeight="bold" fontSize="2xl" mb={4}>
        Panel seguro
      </Text>
      <form method="POST">
        <VStack spacing={4}>
          <Box w="full">
            <Text fontSize="sm" mb={1}>
              Usuario
            </Text>
            <input
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#222",
                color: "#fff",
              }}
              autoComplete="username"
              name="username"
              required
            />
          </Box>
          <Box w="full">
            <Text fontSize="sm" mb={1}>
              Contraseña
            </Text>
            <input
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#222",
                color: "#fff",
              }}
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </Box>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Button type="submit" colorScheme="cyan" w="full">
            Entrar
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
