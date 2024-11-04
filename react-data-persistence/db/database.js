// database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('locations.db');

// Função para criar a tabela de localizações

export const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, latitude REAL, longitude REAL);',
      [],
      () => console.log("Tabela de localizações criada"),
      (tx, error) => {
        console.error("Erro ao criar tabela", error);
      }
    );
  });
};

// Função para salvar uma nova localização

export const saveLocation = (latitude, longitude) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO locations (latitude, longitude) VALUES (?, ?);',
      [latitude, longitude],
      () => {
        console.log("Localização salva");
      },
      (tx, error) => {
        console.error("Erro ao salvar localização", error);
      }
    );
  });
};

// Função para carregar todas as localizações

export const loadLocations = (setLocations) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM locations;',
      [],
      (_, { rows: { _array } }) => setLocations(_array),
      (tx, error) => {
        console.error("Erro ao carregar localizações", error);
      }
    );
  });
};
