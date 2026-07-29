import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing } from '../../theme/designSystem';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    try {
      const res = await api.quiz.startSession(categoryId);
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (processing || !sessionId) return;
    setSelectedOption(optionId);
    setProcessing(true);
    
    try {
      const res = await api.quiz.submitAnswer(sessionId, questions[currentIndex].id, optionId);
      setIsCorrect(res.data.correct);
      
      // Wait a moment to show red/green color
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
      
    } catch (err) {
      console.log(err);
      setProcessing(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setProcessing(false);
    } else {
      // Finish quiz
      try {
        const res = await api.quiz.completeSession(sessionId!);
        navigation.replace('QuizResult', { 
          score: res.data.score, 
          total: res.data.total, 
          coinsEarned: res.data.coinsEarned 
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Failed to load quiz.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.categoryName}>{categoryName}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{currentIndex + 1}/{questions.length}</Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQ.text}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQ.options.map((opt: any) => {
          let bgColor = `${colors.surfaceVariant}50`;
          let borderColor = `${colors.onSurface}22`;
          
          if (selectedOption === opt.id) {
            if (isCorrect === true) {
              bgColor = '#2ecc71';
              borderColor = '#27ae60';
            } else if (isCorrect === false) {
              bgColor = '#e74c3c';
              borderColor = '#c0392b';
            } else {
              bgColor = colors.primary;
              borderColor = colors.primary;
            }
          }

          return (
            <TouchableOpacity 
              key={opt.id} 
              style={[styles.optionCard, { backgroundColor: bgColor, borderColor }]}
              onPress={() => handleSelectOption(opt.id)}
              disabled={processing}
            >
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.bodyLg,
    color: '#fff',
    marginTop: spacing.md,
  },
  backBtn: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  categoryName: {
    ...typography.labelMd,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  progressBadge: {
    backgroundColor: `${colors.primary}30`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  progressText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  questionContainer: {
    marginBottom: spacing.xl * 2,
  },
  questionText: {
    ...typography.displayLg,
    fontSize: 28,
    color: '#fff',
    lineHeight: 36,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  optionText: {
    ...typography.labelMd,
    fontSize: 16,
    color: '#fff',
  },
});
