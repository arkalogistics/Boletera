// components/SeatMap.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  useColorModeValue,
  VStack,
  useBreakpointValue,
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
  // ─── 1) Estados compartidos ───────────────────────────────────────────────────
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [seatList, setSeatList] = useState<Seat[]>([]);

  // ─── 2) Hooks de breakpoint (todos anteriores a cualquier return) ──────────────
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });
  const gapUnits = useBreakpointValue<number>({ base: 1, sm: 2, md: 2 }) ?? 2;
  const seatWidth = useBreakpointValue<number>({ base: 30, sm: 40, md: 50 }) ?? 50;
  const seatHeight = useBreakpointValue<number>({ base: 28, sm: 35, md: 40 }) ?? 40;
  const gapPx = gapUnits * 4;

  // ─── 3) Carga de asientos cuando cambian soldSeats ───────────────────────────────
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

  // ─── 4) Función para alternar selección ─────────────────────────────────────────
  const toggleSeat = (seatId: string) => {
    const updated = new Set(selectedSeats);
    if (updated.has(seatId)) {
      updated.delete(seatId);
    } else {
      updated.add(seatId);
    }
    setSelectedSeats(updated);
    if (onSelectionChange) {
      onSelectionChange(Array.from(updated));
    }
  };

  // ─── 5) Colores según categoría/estado ──────────────────────────────────────────
  const getCategory = (row: string) => {
    const r = row.toUpperCase();
    if (r === "A") return "VIP";
    if (r === "B" || r === "C") return "PREFERENTE";
    return "GENERAL";
  };

  const getBaseColor = (row: string) => {
    const category = getCategory(row);
    if (category === "VIP") return useColorModeValue("yellow.300", "yellow.500");
    if (category === "PREFERENTE") return useColorModeValue("blue.300", "blue.500");
    return useColorModeValue("gray.300", "gray.600");
  };

  const getColor = (seat: Seat) => {
    if (seat.status === "reserved") return "red.500";
    if (selectedSeats.has(seat.id)) return "green.400";
    return getBaseColor(seat.row);
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  //  Versión móvil (base + sm)
  // ─────────────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    // Relación ancho:alto para móvil (solo se usa aquí)
    const paddingBottomRatio = {
      base: "93.33%",   // 28/30
      sm: "87.5%",      // 35/40
      md: "80%",        // no aplica, pero lo definimos por consistencia
    };

    return (
      <Box w="full">
        <VStack spacing={8} align="center" w="full">
          {/* ESCENARIO en móvil */}
          <Box
            w="100%"
            h={{ base: "28px", sm: "35px", md: "40px" }}
            bg="gray.700"
            borderRadius="4px"
            textAlign="center"
            lineHeight={{ base: "28px", sm: "35px", md: "40px" }}
          >
            <Text color="white" fontWeight="bold">
              ESCENARIO
            </Text>
          </Box>

          {/* GRILLA DE ASIENTOS en móvil */}
          <VStack spacing={4} align="center" w="full">
            {rowDefinitions.map(({ row, cols }) => {
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
                    Fila {row} ({getCategory(row)})
                  </Text>

                  {/* Grid con fracciones 1fr para ocupar todo ancho */}
                  <Grid
                    templateColumns={`repeat(${cols}, 1fr)`}
                    gap={gapUnits}
                    w="100%"
                  >
                    {seatsInThisRow.map((seat) => (
                      <Box
                        key={seat.id}
                        position="relative"
                        w="100%"
                        pb={paddingBottomRatio}
                        cursor={
                          seat.status === "reserved" ? "not-allowed" : "pointer"
                        }
                        onClick={() => {
                          if (seat.status === "reserved") return;
                          toggleSeat(seat.id);
                        }}
                      >
                        {/* Fondo del asiento */}
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          w="100%"
                          h="100%"
                          bg={getColor(seat)}
                          borderRadius="4px"
                          transition="background-color 0.2s"
                          _hover={{
                            border:
                              seat.status === "reserved"
                                ? undefined
                                : "2px solid",
                            borderColor:
                              seat.status === "reserved"
                                ? undefined
                                : "cyan.300",
                          }}
                        />
                        {/* Texto centrado (A1, etc.) */}
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
      </Box>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //  Versión escritorio (md en adelante)
  // ─────────────────────────────────────────────────────────────────────────────────

  // Cálculo del ancho total mínimo para forzar scroll horizontal si hace falta
  const maxCols = Math.max(...rowDefinitions.map((r) => r.cols));
  const totalWidthPx = maxCols * seatWidth + (maxCols - 1) * gapPx;

  return (
    <Box w="full" overflowX="auto">
      <VStack spacing={8} align="center" minW={`${totalWidthPx}px`}>
        {/* ESCENARIO en desktop */}
        <Box
          minW={`${totalWidthPx}px`}
          h={`${seatHeight}px`}
          bg="gray.700"
          borderRadius="4px"
          textAlign="center"
          lineHeight={`${seatHeight}px`}
        >
          <Text color="white" fontWeight="bold">
            ESCENARIO
          </Text>
        </Box>

        {/* GRILLA DE ASIENTOS en desktop */}
        <VStack spacing={4} align="center" w="full">
          {rowDefinitions.map(({ row, cols }) => {
            const seatsInThisRow = seatList.filter((s) => s.row === row);
            const rowMinWidthPx = seatWidth * cols + (cols - 1) * gapPx;

            return (
              <Box key={row} w="full" minW={`${rowMinWidthPx}px`}>
                {/* Etiqueta de la fila */}
                <Text
                  mb={2}
                  fontSize="md"
                  fontWeight="semibold"
                  color="white"
                  textAlign="left"
                >
                  Fila {row} ({getCategory(row)})
                </Text>

                <Grid
                  templateColumns={`repeat(${cols}, ${seatWidth}px)`}
                  justifyContent="center"
                  gap={gapUnits}
                >
                  {seatsInThisRow.map((seat) => (
                    <Box
                      key={seat.id}
                      w={`${seatWidth}px`}
                      h={`${seatHeight}px`}
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
                      {/* Fondo del asiento */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                        bg={getColor(seat)}
                        transition="background-color 0.2s"
                      />
                      {/* Texto centrado */}
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
    </Box>
  );
};
