import { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert } from "react-native";
import {
  Appbar,
  Button,
  List,
  PaperProvider,
  Switch,
  Text,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import myColors from "./assets/colors.json";
import myColorsDark from "./assets/colorsDark.json";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createTable, saveLocation, loadLocations } from './database'; // Importa as funções do banco de dados

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const [theme, setTheme] = useState({
    ...DefaultTheme,
    colors: myColors.colors,
  });

  // Carrega o dark mode do AsyncStorage
  
  async function loadDarkMode() {
    try {
      const value = await AsyncStorage.getItem('darkMode');
      if (value !== null) {
        setIsSwitchOn(value === 'true');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Salva a configuração do dark mode no AsyncStorage

  async function saveDarkMode(value) {
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
    } catch (error) {
      console.error(error);
    }
  }

  // Evento de mudança do switch do dark mode

  async function onToggleSwitch() {
    const newValue = !isSwitchOn;
    setIsSwitchOn(newValue);
    await saveDarkMode(newValue);
  }

  // Captura a localização atual do usuário

  async function getLocation() {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão de localização não concedida");
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      await saveLocation(coords.latitude, coords.longitude); // Salva a localização
      loadLocations(setLocations); // Recarrega as localizações após salvar uma nova
    } catch (error) {
      console.error(error);
      Alert.alert("Erro ao capturar a localização");
    } finally {
      setIsLoading(false);
    }
  }

  // Cria a tabela ao iniciar o aplicativo

  useEffect(() => {
    createTable();
    loadDarkMode();
    loadLocations(setLocations); // Carrega as localizações do banco de dados
  }, []);

  // Atualiza o tema quando o dark mode é alterado

  useEffect(() => {
    if (isSwitchOn) {
      setTheme({ ...theme, colors: myColorsDark.colors });
    } else {
      setTheme({ ...theme, colors: myColors.colors });
    }
  }, [isSwitchOn]);

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="My Location BASE" />
      </Appbar.Header>
      <View style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.containerDarkMode}>
          <Text>Modo Escuro</Text>
          <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
        </View>
        <Button
          style={styles.containerButton}
          icon="map"
          mode="contained"
          loading={isLoading}
          onPress={getLocation}
        >
          Capturar localização
        </Button>

        <FlatList
          style={styles.containerList}
          data={locations}
          renderItem={({ item }) => (
            <List.Item
              title={`Localização ${item.id}`}
              description={`Latitude: ${item.latitude} | Longitude: ${item.longitude}`}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  containerDarkMode: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    margin: 10,
  },
  containerList: {
    margin: 10,
    height: "100%",
  },
});
