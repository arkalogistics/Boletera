// components/SeatMap.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  useColorModeValue,
  VStack,
  Button,
} from "@chakra-ui/react";

type SeatStatus = "available" | "reserved" | "selected";

interface Seat {
  id: string;       // ej. "A-1" o "K-14"
  row: string;      // "A" .. "K"
  col: number;      // 1 .. número de asientos en esa fila
  status: SeatStatus;
}

interface SeatMapProps {
  soldSeats: string[];                         // Butacas ya vendidas
  onSelectionChange?: (selectedSeats: string[]) => void;  
  // callback opcional que notifica al padre cada vez que cambie la selección
}

/**
 * Distribución de filas y número de asientos por fila (total 146).
 * A:11, B:13, C:14, D:13, E:14, F:13, G:14, H:13, I:14, J:13, K:14.
 */
const rowDefinitions: { row: string; cols: number }[] = [
  { row: "A", cols: 11 },
  { row: "B", cols: 13 },
  { row: "C", cols: 14 },
  { row: "D", cols: 13 },
  { row: "E", cols: 14 },
  { row: "F", cols: 13 },
  { row: "G", cols: 14 },
  { row: "H", cols: 13 },
  { row: "I", cols: 14 },
  { row: "J", cols: 13 },
  { row: "K", cols: 14 },
];

export const SeatMap: React.FC<SeatMapProps> = ({ soldSeats, onSelectionChange }) => {
  // Conjunto de asientos que el usuario ha seleccionado (verde)
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  // Lista completa de butacas con su estado inicial ("available" o "reserved")
  const [seatList, setSeatList] = useState<Seat[]>([]);

  // Cada vez que cambie la lista soldSeats, regeneramos seatList:
  useEffect(() => {
    const soldSet = new Set(soldSeats);
    const allSeats: Seat[] = [];

    rowDefinitions.forEach(({ row, cols }) => {
      for (let c = 1; c <= cols; c++) {
        const id = `${row}-${c}`;
        const status: SeatStatus = soldSet.has(id) ? "reserved" : "available";
        allSeats.push({ id, row, col: c, status });
      }
    });

    setSeatList(allSeats);
  }, [soldSeats]);

  // Alterna un asiento disponible a "selected" o lo deselecciona
  const toggleSeat = (seatId: string) => {
    const updated = new Set(selectedSeats);
    if (updated.has(seatId)) {
      updated.delete(seatId);
    } else {
      updated.add(seatId);
    }
    setSelectedSeats(updated);

    // Notificar al padre (EventPage) si existe callback
    if (onSelectionChange) {
      onSelectionChange(Array.from(updated));
    }
  };

  // Determina el color según el estado del asiento
  const getColor = (seat: Seat) => {
    if (seat.status === "reserved") return "red.500";        // Estatus "reserved" → rojo
    if (selectedSeats.has(seat.id)) return "green.400";      // Estatus "selected" → verde
    return useColorModeValue("gray.900", "gray.100");        // Estatus "available" → negro o blanco
  };

  return (
    <VStack spacing={8} align="center">
      {/* ───────── ESCENARIO ───────── */}
      {(() => {
        // La fila más ancha son 14 butacas → ancho total = 14*60px + 13*8px = 944px
        const maxCols = Math.max(...rowDefinitions.map((r) => r.cols));
        const totalWidthPx = maxCols * 60 + (maxCols - 1) * 8;
        return (
          <Box
            w={`${totalWidthPx}px`}
            h="40px"
            bg="gray.700"
            borderRadius="4px"
            textAlign="center"
            lineHeight="40px"
          >
            <Text color="white" fontWeight="bold">
              ESCENARIO
            </Text>
          </Box>
        );
      })()}

      {/* ───────── GRILLA DE ASIENTOS (filas A a K) ───────── */}
      <VStack spacing={4} align="center">
        {rowDefinitions.map(({ row, cols }) => {
          // Filtrar butacas de esta fila
          const seatsInThisRow = seatList.filter((s) => s.row === row);

          return (
            <Box key={row} w="full">
              {/* Etiqueta de la fila */}
              <Text
                mb={2}
                fontSize="md"
                fontWeight="semibold"
                color="white"
                textAlign="left"
              >
                Fila {row}
              </Text>

              {/* Grid con X columnas según "cols" */}
              <Grid
                templateColumns={`repeat(${cols}, 60px)`}
                justifyContent="center"
                gap={2} // 8px de separación
              >
                {seatsInThisRow.map((seat) => (
                  <Box
                    key={seat.id}
                    w="60px"
                    h="40px"
                    position="relative"
                    cursor={
                      seat.status === "reserved" ? "not-allowed" : "pointer"
                    }
                    onClick={() => {
                      if (seat.status === "reserved") return;
                      toggleSeat(seat.id);
                    }}
                    borderRadius="4px"
                    overflow="hidden"
                    _hover={{
                      borderColor:
                        seat.status === "reserved"
                          ? undefined
                          : "cyan.300",
                      borderWidth: seat.status === "reserved" ? 0 : "2px",
                    }}
                  >
                    {/* Fondo según estado */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      w="100%"
                      h="100%"
                      bg={getColor(seat)}
                      transition="background-color 0.2s"
                    />

                    {/* Etiqueta centrada: “A1”, etc. */}
                    <Text
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      fontSize="xs"
                      fontWeight="bold"
                      color="white"
                      pointerEvents="none"
                    >
                      {seat.row}
                      {seat.col}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};
