import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

const WORD_LENGTH = 6;

const WordCompletionScreen = () => {
  const [originalWord, setOriginalWord] = useState('');
  const [maskedWord, setMaskedWord] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [answerShown, setAnswerShown] = useState(false);
  const [wordInfo, setWordInfo] = useState(null); // NEW
  const navigation = useNavigation();

  useEffect(() => {
    fetchNewWord();
  }, []);

  const fetchNewWord = async () => {
    setLoading(true);
    setFeedback('');
    setAnswerShown(false);
    setWordInfo(null); // Clear old wordInfo

    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${'?'.repeat(WORD_LENGTH)}&max=50`);
      const data = await response.json();
      const filtered = data.filter(word => /^[a-z]+$/.test(word.word));
      const randomWord = filtered[Math.floor(Math.random() * filtered.length)]?.word.toLowerCase();

      if (!randomWord || randomWord.length !== WORD_LENGTH) {
        fetchNewWord();
        return;
      }

      const indexesToHide = new Set();
      while (indexesToHide.size < 2 + Math.floor(Math.random() * 2)) {
        indexesToHide.add(Math.floor(Math.random() * WORD_LENGTH));
      }

      const masked = randomWord.split('').map((char, index) =>
        indexesToHide.has(index) ? '' : char
      );

      setOriginalWord(randomWord);
      setMaskedWord(masked);
      setUserInput(masked);
    } catch (e) {
      Alert.alert('Error', 'Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (value, index) => {
    const newInput = [...userInput];
    newInput[index] = value.toLowerCase();
    setUserInput(newInput);
  };

  const checkAnswer = () => {
    if (answerShown) return;

    const attempt = userInput.join('');
    if (attempt === originalWord) {
      setScore(score + 1);
      setFeedback('✅ Correct!');
      setTimeout(fetchNewWord, 1000);
    } else {
      setFeedback('❌ Try again!');
    }
  };

  const showAnswer = async () => {
    setUserInput(originalWord.split(''));
    setFeedback(`📘 Answer: ${originalWord}`);
    setAnswerShown(true);
    await fetchWordInfo(originalWord); // Fetch info about word
  };

  const fetchWordInfo = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const meaningObj = entry.meanings?.[0]?.definitions?.[0];

        const synonyms = meaningObj?.synonyms || [];
        const antonyms = meaningObj?.antonyms || [];
        const definition = meaningObj?.definition || 'No definition found.';

        setWordInfo({
          definition,
          synonyms,
          antonyms,
        });
      } else {
        setWordInfo({
          definition: 'No definition found.',
          synonyms: [],
          antonyms: [],
        });
      }
    } catch (error) {
      console.error(error);
      setWordInfo({
        definition: 'Failed to fetch definition.',
        synonyms: [],
        antonyms: [],
      });
    }
  };

  const renderInputs = () =>
    userInput.map((letter, index) => (
      <TextInput
        key={index}
        style={[
          styles.letterInput,
          maskedWord[index] === '' ? styles.editable : styles.fixed,
        ]}
        value={letter}
        maxLength={1}
        editable={!answerShown && maskedWord[index] === ''}
        onChangeText={(val) => handleInput(val, index)}
        autoCapitalize="none"
      />
    ));

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#00E5FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Word Completion</Text>
      </View>

      <Text style={styles.subtitle}>Score: {score}</Text>

      {loading ? (
        <ActivityIndicator color="#00E5FF" size="large" />
      ) : (
        <View style={styles.wordContainer}>{renderInputs()}</View>
      )}

      <Text style={styles.feedback}>{feedback}</Text>


      {wordInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📚 Meaning:</Text>
          <Text style={styles.infoText}>{wordInfo.definition}</Text>
          {wordInfo?.partOfSpeech?
          <>
            <Text style={styles.infoTitle}>📚 Part Of Speech:</Text>
            <Text style={styles.infoText}>{wordInfo?.partOfSpeech}</Text>
          </>
          :""
        
}
          {wordInfo.synonyms.length > 0 && (
            <>
              <Text style={styles.infoTitle}>🔵 Synonyms:</Text>
              <Text style={styles.infoText}>{wordInfo.synonyms.join(', ')}</Text>
            </>
          )}

          {wordInfo.antonyms.length > 0 && (
            <>
              <Text style={styles.infoTitle}>🔴 Antonyms:</Text>
              <Text style={styles.infoText}>{wordInfo.antonyms.join(', ')}</Text>
            </>
          )}
        </View>
      )}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={checkAnswer} disabled={loading || answerShown}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={showAnswer} disabled={loading || answerShown}>
          <Text style={styles.secondaryButtonText}>Show Answer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={fetchNewWord} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#E5E5E5',
    marginBottom: 30,
  },
  wordContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    gap: 4,
  },
  letterInput: {
    width: 45,
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    borderRadius: 8,
    borderWidth: 2,
    color: '#fff',
    backgroundColor: '#1B263B',
    borderColor: '#00E5FF',
  },
  editable: {
    borderColor: '#FFD700',
  },
  fixed: {
    backgroundColor: '#1B263B',
    color: '#00FF7F',
  },
  feedback: {
    fontSize: 20,
    marginVertical: 10,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#0D1B2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#1B263B',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: "row",
    position: 'absolute',
    top: 0,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
    padding: 20,
  },
  headerTitle: {
    color: "#00E5FF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  infoContainer: {

    marginTop: 30,
    backgroundColor: '#1B263B',
    borderRadius: 10,
    padding: 20,
    borderColor: '#00E5FF',
    borderWidth: 1,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#E5E5E5',
    marginBottom: 10,
  },
});

export default WordCompletionScreen;
