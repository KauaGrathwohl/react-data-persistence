import { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { getAllLocations, insertLocation } from "./db";

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState(null);

  // Theme

  const [theme, setTheme] = useState({
    ...DefaultTheme,
    myOwnProperty: true,
    colors: myColors.colors,
  });


  async function loadDarkMode() {
    try {
      const hasDarkMode = await AsyncStorage.getItem('@darkMode');

      if (hasDarkMode === 'true') setIsSwitchOn(true);
    } catch (e) {
      console.error(e)
    }
  }


  async function onToggleSwitch() {
    setIsSwitchOn(!isSwitchOn);

    try {
      await AsyncStorage.setItem('@darkMode', (!isSwitchOn).toString());
    } catch(e) {
      console.error(e)
    }
  }


  async function getLocation() {
    setIsLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setIsLoading(false);

      return;
    }
  
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    await insertLocation({ latitude, longitude });
    await loadLocations();

    setIsLoading(false);
  }


  async function loadLocations() {
    setIsLoading(true);

    const locations = await getAllLocations();

    setLocations(locations);
    setIsLoading(false);
  }

  // Use Effect para carregar o darkMode e as localizações salvas no banco de dados

  useEffect(() => {
    loadDarkMode();
    loadLocations();
  }, []);

  // Efetiva a alteração do tema dark/light quando a variável isSwitchOn é alterada

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
          <Text>Dark Mode</Text>
          <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
        </View>
        <Button
          style={styles.containerButton}
          icon="map"
          mode="contained"
          loading={isLoading}
          onPress={() => getLocation()}
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
            ></List.Item>
          )}
        ></FlatList>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
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
