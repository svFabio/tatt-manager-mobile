import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthHeaderProps {
  mes: Date;
  onPrev: () => void;
  onNext: () => void;
}

export const MonthHeader: React.FC<MonthHeaderProps> = ({ mes, onPrev, onNext }) => {
  const titulo = format(mes, "MMMM yyyy", { locale: es }).toUpperCase();

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Text className="text-white text-xl font-bold tracking-wide">{titulo}</Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onPrev}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-[#1E1E1E] items-center justify-center border border-[#2A2A2A]"
        >
          <Feather name="chevron-left" size={18} color="#D1D5DB" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-[#1E1E1E] items-center justify-center border border-[#2A2A2A]"
        >
          <Feather name="chevron-right" size={18} color="#D1D5DB" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
