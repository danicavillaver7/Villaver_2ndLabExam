import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import StudentCard, { type Student } from '@/components/StudentCard';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/constants/api';

export default function StudentsScreen() {
  const { token, logout } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401) {
        await logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'Unable to load students.',
        );
      }

      const studentList = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
          ? data.students
          : Array.isArray(data?.data)
            ? data.data
            : null;

      if (!studentList) {
        throw new Error('The student response has an invalid format.');
      }

      setStudents(studentList);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load students.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      loadStudents();
    } else {
      setLoading(false);
    }
  }, [token, loadStudents]);

  const filteredStudents = students.filter((student) =>
    (student.name ?? '').toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>

      <TextInput
        style={styles.input}
        accessibilityLabel="Search students"
        placeholder="Search by name"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color="#245bb2" />
          <Text style={styles.text}>Loading students...</Text>
        </View>
      ) : error ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <Text style={styles.error}>{error}</Text>

          <Pressable accessibilityRole="button" onPress={loadStudents}>
            <Text style={styles.link}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={({ item }) => <StudentCard student={item} />}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.text}>
                {search.trim()
                  ? 'No students match your search.'
                  : 'No students found.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f2f5fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17324d',
    marginBottom: 20,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#c6d2e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#17324d',
    marginBottom: 20,
  },
  state: {
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  text: {
    color: '#536579',
  },
  error: {
    color: '#b42318',
    textAlign: 'center',
  },
  link: {
    color: '#245bb2',
    padding: 12,
  },
});
