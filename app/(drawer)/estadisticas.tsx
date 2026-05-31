import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/StyledText";
import { COLORS } from "@/src/theme/colors";
import { Feather } from "@expo/vector-icons";
import Svg, { Polyline, Circle, G, Text as SvgText, Path } from "react-native-svg";
import api from "@/src/api/axios";

interface StatsData {
  estudio: string;
  citasPorMes: { labels: string[]; valores: number[] };
  articulosUsados: {
    totalArticulos: number;
    detalles: { name: string; cantidad: number; color: string }[];
  };
  topArtistas: { artista: string; monto: number }[];
}

export default function StatsScreen() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/statistics/estudio");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Text className="text-white">Error al cargar estadísticas</Text>
      </View>
    );
  }

  // --- Line Chart Math (Citas por Mes) ---
  const chartWidth = 320;
  const chartHeight = 150;
  const lineLabels = data.citasPorMes.labels.slice(0, 7);
  const lineValues = data.citasPorMes.valores.slice(0, 7);
  const rawMaxLine = Math.max(...lineValues, 5);
  const stepYScale = Math.ceil(rawMaxLine / 5);
  const maxLineVal = stepYScale * 5;
  const stepX = chartWidth / (lineLabels.length - 1 || 1);
  const points = lineValues.map((val, i) => {
    const x = i * stepX;
    const y = chartHeight - (val / maxLineVal) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // --- Donut Chart Math ---
  const donutContainerSize = 300;
  const size = 160;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;
  const totalItems = Math.max(data.articulosUsados.totalArticulos, 1);

  // --- Bar Chart Math ---
  const maxArtistMonto = Math.max(...data.topArtistas.map((a) => a.monto), 25);

  return (
    <ScrollView className="flex-1 bg-dark px-4 pt-6">
      <Text className="text-gray-300 font-semibold mb-4 ml-1">
        Métricas detalladas del estudio: {data.estudio}
      </Text>

      {/* CHART 1: LINE CHART */}
      <View className="bg-dark-100 rounded-2xl p-4 mb-6" style={{ borderWidth: 1, borderColor: COLORS.dark[200] }}>
        <View className="flex-row items-center mb-6">
          <Feather name="calendar" size={18} color={COLORS.primary.DEFAULT} />
          <Text className="text-white text-lg font-bold ml-2">Sesiones en esta semana</Text>
        </View>

        <View className="flex-row">
          <View className="justify-between h-[150px] mr-2">
            {[maxLineVal, maxLineVal * 0.8, maxLineVal * 0.6, maxLineVal * 0.4, maxLineVal * 0.2, 0].map((v, i) => (
              <Text key={i} className="text-gray-400 text-xs">{Math.round(v)}</Text>
            ))}
          </View>
          <View className="flex-1">
            <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
                <Polyline key={`h-${i}`} points={`0,${chartHeight * ratio} ${chartWidth},${chartHeight * ratio}`} stroke={COLORS.dark[200]} strokeWidth="1" />
              ))}
              {lineLabels.map((_, i) => (
                <Polyline key={`v-${i}`} points={`${i * stepX},0 ${i * stepX},${chartHeight}`} stroke={COLORS.dark[200]} strokeWidth="1" />
              ))}
              <Polyline points={points} fill="none" stroke={COLORS.primary.DEFAULT} strokeWidth="3" />
              {lineValues.map((val, i) => (
                <Circle key={`c-${i}`} cx={i * stepX} cy={chartHeight - (val / maxLineVal) * chartHeight} r="4" fill={COLORS.primary.DEFAULT} />
              ))}
            </Svg>
            <View className="flex-row justify-between mt-2">
              {lineLabels.map((label, i) => (
                <Text key={i} className="text-gray-400 text-xs w-[30px] text-center">{label}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* CHART 2: DONUT CHART */}
      <View className="bg-dark-100 rounded-2xl p-4 mb-6" style={{ borderWidth: 1, borderColor: COLORS.dark[200] }}>
        <View className="flex-row items-center mb-4">
          <Feather name="box" size={18} color={COLORS.primary.DEFAULT} />
          <Text className="text-white text-lg font-bold ml-2">Artículos Usados</Text>
        </View>

        <View className="items-center justify-center py-4 relative h-[220px] w-full overflow-visible">
          {/* Centered strict 300x220 container to guarantee 1:1 mapping between SVG and Native Views */}
          <View style={{ width: 300, height: 220, position: "absolute", alignSelf: "center" }}>
            {(() => {
              const svgSize = 130;
              const svgStrokeWidth = 24;
              const svgRadius = (svgSize - svgStrokeWidth) / 2;
              const totalItems = data.articulosUsados.detalles.reduce((acc, item) => acc + item.cantidad, 0) || 1;
              let currentPercent = 0;

              const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
                const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
                return {
                  x: centerX + (radius * Math.cos(angleInRadians)),
                  y: centerY + (radius * Math.sin(angleInRadians))
                };
              };

              const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
                if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
                const start = polarToCartesian(x, y, radius, endAngle);
                const end = polarToCartesian(x, y, radius, startAngle);
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                return [
                  "M", start.x, start.y, 
                  "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
                ].join(" ");
              };

              return (
                <Svg width={300} height={220}>
                  <G x={150} y={110}>
                    {data.articulosUsados.detalles.map((item, index) => {
                      const percent = item.cantidad / totalItems;
                      const startAngle = currentPercent * 360;
                      const endAngle = (currentPercent + percent) * 360;
                      const midAngle = startAngle + (endAngle - startAngle) / 2;
                      currentPercent += percent;

                      if (item.cantidad <= 0) return null;

                      const rad = (midAngle - 90) * Math.PI / 180;
                      const lineStartRadius = svgRadius + svgStrokeWidth / 2;
                      const lineEndRadius = svgRadius + svgStrokeWidth / 2 + 15;
                      const x1 = Math.cos(rad) * lineStartRadius;
                      const y1 = Math.sin(rad) * lineStartRadius;
                      const x2 = Math.cos(rad) * lineEndRadius;
                      const y2 = Math.sin(rad) * lineEndRadius;
                      const isRight = x2 > 0;
                      const x3 = x2 + (isRight ? 15 : -15);

                      return (
                        <G key={`slice-${index}`}>
                          <Path
                            d={describeArc(0, 0, svgRadius, startAngle, endAngle)}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={svgStrokeWidth}
                          />
                          <Circle cx={x1} cy={y1} r={3} fill={COLORS.text.primary} />
                          <Polyline points={`${x1},${y1} ${x2},${y2} ${x3},${y2}`} fill="none" stroke={item.color} strokeWidth="1" />
                        </G>
                      );
                    })}
                  </G>
                </Svg>
              );
            })()}

            {/* Render absolute text labels mapped 1:1 to SVG 150,110 center */}
            {(() => {
              const svgSize = 130;
              const svgStrokeWidth = 24;
              const svgRadius = (svgSize - svgStrokeWidth) / 2;
              const totalItems = data.articulosUsados.detalles.reduce((acc, item) => acc + item.cantidad, 0) || 1;
              let currentPercentLabel = 0;

              return data.articulosUsados.detalles.map((item, index) => {
                const percent = item.cantidad / totalItems;
                const midAngle = (currentPercentLabel + percent / 2) * 360 - 90;
                currentPercentLabel += percent;

                if (item.cantidad <= 0) return null;

                const rad = (midAngle * Math.PI) / 180;
                const lineEndRadius = svgRadius + svgStrokeWidth / 2 + 15;
                const x2 = Math.cos(rad) * lineEndRadius;
                const y2 = Math.sin(rad) * lineEndRadius;
                const isRight = x2 > 0;
                const x3 = x2 + (isRight ? 15 : -15);

                return (
                  <View
                    key={`label-${index}`}
                    style={{
                      position: "absolute",
                      top: 110 + y2 - 10,
                      ...(isRight ? { left: 150 + x3 + 5 } : { right: 150 + Math.abs(x3) + 5 }),
                      width: 85,
                    }}
                  >
                    <Text 
                      className="text-gray-300" 
                      style={{ 
                        fontSize: 12, 
                        fontFamily: "Montserrat_400Regular", 
                        textAlign: isRight ? "left" : "right" 
                      }}
                      numberOfLines={2}
                    >
                      {`${item.name}: ${item.cantidad}`}
                    </Text>
                  </View>
                );
              });
            })()}

            <View className="absolute items-center justify-center pointer-events-none" style={{ top: 110 - 25, left: 150 - 45, width: 90, height: 50 }}>
              <Text className="text-gray-400 font-bold text-[14px] text-center">Artículos</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CHART 3: HORIZONTAL BAR CHART */}
      <View className="bg-dark-100 rounded-2xl p-4 mb-12" style={{ borderWidth: 1, borderColor: COLORS.dark[200] }}>
        <View className="flex-row items-center mb-6">
          <Feather name="users" size={18} color={COLORS.primary.DEFAULT} />
          <Text className="text-white text-lg font-bold ml-2">Sesiones por Artista (Top 5)</Text>
        </View>

        <View className="mb-2">
          {data.topArtistas.map((item, index) => {
            const rawMax = Math.max(...data.topArtistas.map((a) => a.monto), 5);
            const step = Math.ceil(rawMax / 5);
            const actualMax = step * 5;
            const widthPercentage = Math.max((item.monto / actualMax) * 100, 2);
            return (
              <View key={index} className="flex-row items-center mb-4">
                <Text className="text-gray-300 text-sm w-16" numberOfLines={1}>{item.artista}</Text>
                <View className="flex-1 ml-2 bg-dark-200 h-6 rounded-r-md rounded-l-sm overflow-hidden">
                  <View className="h-full bg-purple-600 rounded-r-md" style={{ width: `${widthPercentage}%` }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* X Axis */}
        <View className="flex-row justify-between pl-16 border-t border-gray-700 pt-2">
          {(() => {
            const rawMax = Math.max(...data.topArtistas.map((a) => a.monto), 5);
            const step = Math.ceil(rawMax / 5);
            return Array.from({ length: 6 }, (_, i) => i * step).map((val) => (
              <Text key={val} className="text-gray-400 text-xs">{val}</Text>
            ));
          })()}
        </View>
      </View>
    </ScrollView>
  );
}
