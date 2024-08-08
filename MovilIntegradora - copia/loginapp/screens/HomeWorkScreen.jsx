import React from 'react';
import { SafeAreaView, Button, StyleSheet, Linking, View } from 'react-native';

const App = () => {
  const handlePress = () => {
    const url = 'https://www.example.com'; // Cambia esto al enlace web que quieres abrir
    Linking.openURL(url).catch((err) => console.error('Error al intentar abrir el enlace', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Abrir Enlace Web" onPress={handlePress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    margin: 20,
  },
});

export default App;