import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { SessionsAPI, type SessionListItem, type ArtistaOption } from '../../../api/sessions';
import { SessionCard } from '../components/SessionCard';
import { COLORS } from '../../../theme/colors';

export default function SessionHistoryScreen() {
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [artistas, setArtistas] = useState<ArtistaOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedArtista, setSelectedArtista] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const load = useCallback(async (searchTerm: string, artistaFilter: number | null) => {
    try {
      setLoading(true);
      const [sessRes, artRes] = await Promise.all([
        SessionsAPI.getAll({
          artistaId: artistaFilter ?? undefined,
          search: searchTerm.trim() || undefined,
        }),
        SessionsAPI.getArtistas(),
      ]);
      setSessions(sessRes.data ?? []);
      setArtistas(artRes.data ?? []);
    } catch (e) {
      console.error('[SessionHistory]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    load(debouncedSearch, selectedArtista);
  }, [debouncedSearch, selectedArtista, load]);

  const selectedArtistaName = useMemo(() => {
    if (!selectedArtista) return 'Artistas';
    return artistas.find((a) => a.id === selectedArtista)?.nombre ?? 'Artistas';
  }, [selectedArtista, artistas]);

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['bottom']}>
      {/* ─── Controls: Search & Filter ─── */}
      <View className="px-4 pt-4 pb-2 flex-row items-center" style={{ gap: 8 }}>
        {/* Search Input */}
        <View className="flex-1 h-[42px] rounded-xl justify-center" style={{ backgroundColor: COLORS.dark[100] }}>
          <View className="absolute left-3 z-10">
            <MaterialIcons name="search" size={14} color={COLORS.text.muted} />
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar"
            placeholderTextColor={COLORS.text.muted}
            className="flex-1 text-white text-sm"
            style={{ paddingLeft: 36, paddingRight: 12 }}
          />
        </View>

        {/* Artista Dropdown Trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setDropdownOpen(true)}
          className="h-[42px] rounded-xl flex-row items-center px-3"
          style={{
            backgroundColor: COLORS.dark[100],
            borderWidth: 1,
            borderColor: COLORS.dark[200],
            minWidth: 120,
          }}
        >
          <Text className="text-white text-sm flex-1" numberOfLines={1}>
            {selectedArtistaName}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={18} color={COLORS.text.muted} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* ─── Sessions List ─── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" />
        </View>
      ) : sessions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.primary.ghost }}
          >
            <MaterialIcons name="history" size={36} color={COLORS.primary.DEFAULT} />
          </View>
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold text-center">
            No se encontraron sesiones
          </Text>
          <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1 text-center">
            Las sesiones finalizadas aparecerán aquí
          </Text>
        </View>
      ) : (
        <View className="flex-1 mx-4 mt-2 rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.dark[100], borderWidth: 1, borderColor: COLORS.border.subtle }}>
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SessionCard
                session={item}
                onPress={() => router.push(`/(drawer)/sessions?detail=${item.id}` as any)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* ─── Artista Picker Modal ─── */}
      <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
        <Pressable className="flex-1 bg-black/60 justify-center items-center" onPress={() => setDropdownOpen(false)}>
          <View className="w-[280px] rounded-2xl p-4" style={{ backgroundColor: COLORS.dark[100] }}>
            <Text className="text-white text-base font-bold mb-4">Filtrar por artista</Text>

            {/* "Todos" option */}
            <TouchableOpacity
              onPress={() => {
                setSelectedArtista(null);
                setDropdownOpen(false);
              }}
              className="py-3 px-3 rounded-lg mb-1"
              style={{ backgroundColor: selectedArtista === null ? COLORS.dark[200] : 'transparent' }}
            >
              <Text className="text-white text-sm">Todos los artistas</Text>
            </TouchableOpacity>

            {artistas.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => {
                  setSelectedArtista(a.id);
                  setDropdownOpen(false);
                }}
                className="py-3 px-3 rounded-lg mb-1"
                style={{ backgroundColor: selectedArtista === a.id ? COLORS.dark[200] : 'transparent' }}
              >
                <Text className="text-white text-sm">{a.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
