import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/constants/api';
import type { Student } from '@/components/StudentCard';

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, logout } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudent = useCallback(async () => {
    if (!id) {
      setError('Student ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (response.status === 401) {
        await logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'Unable to load student details.',
        );
      }

      const studentData = data?.student ?? data?.data ?? data;

      if (!studentData || typeof studentData !== 'object') {
        throw new Error('Student record was not found.');
      }

      setStudent(studentData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load student details.',
      );
    } finally {
      setLoading(false);
    }
  }, [id, token, logout]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245bb2" />
        <Text style={styles.message}>Loading student details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={loadStudent}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Student record was not found.</Text>

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {student.name || 'Name not available'}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Student ID</Text>
          <Text style={styles.value}>
            {student.id !== undefined && student.id !== null
              ? String(student.id)
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>
            {student.email || 'Not available'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Course</Text>
          <Text style={styles.value}>
            {student.course || 'Not available'}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryButtonText}>Back to Students</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f2f5fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#17324d',
    marginBottom: 24,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#e1e7ef',
    paddingVertical: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68788c',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#17324d',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f2f5fa',
  },
  message: {
    color: '#536579',
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    color: '#b42318',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#245bb2',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#245bb2',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#245bb2',
    fontWeight: '600',
  },
});
