import { Text, View, StyleSheet } from 'react-native';
import { useCactusLM, CactusConfig } from 'cactus-react-native';

CactusConfig.telemetryToken = 'your-telemetry-token-here';

export default function App() {
  const cactusLM = useCactusLM();

  const getModels = async () => {
    try {
      const models = await cactusLM.getModels();
      console.log('Available models:', models);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting models:', errorMessage);
    }
  };

  const runCompletion = async () => {
    try {
      const result = await cactusLM.complete({
        messages: [{ role: 'user', content: 'Hello, World!' }],
      });
      console.log('Completion result:', result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error during completion:', errorMessage);
    }
  };

  const stopCompletion = async () => {
    try {
      await cactusLM.stop();
      console.log('Stopped completion successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error during stopping completion:', errorMessage);
    }
  };

  const runEmbed = async () => {
    try {
      const result = await cactusLM.embed({ text: 'Hello, World!' });
      console.log('Embedding result:', result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error during embedding:', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text>error: {cactusLM.error}</Text>
      <Text>download progress: {cactusLM.downloadProgress}</Text>
      <Text>isInitialized: {cactusLM.isInitialized}</Text>
      <Text>isGenerating: {cactusLM.isGenerating}</Text>
      <Text>Streaming Response: {cactusLM.completion}</Text>
      <Text onPress={getModels} style={styles.button}>
        Get Models
      </Text>
      <Text onPress={runCompletion} style={styles.button}>
        Run Completion and console.log Result
      </Text>
      <Text onPress={stopCompletion} style={styles.button}>
        Stop Completion
      </Text>
      <Text onPress={runEmbed} style={styles.button}>
        Run Embedding and console.log Result
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  button: {
    padding: 12,
    backgroundColor: 'lightgreen',
  },
});
