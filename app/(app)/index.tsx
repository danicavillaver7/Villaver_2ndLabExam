import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.welcome}>
          Welcome, {user?.name || 'Student'}
        </Text>

        <Text style={styles.text}>
          {user?.email || 'No email available'}
        </Text>

        <Text style={styles.text}>
          Role: {user?.role || 'Student'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Student Service</Text>

        <Text style={styles.text}>
          Use the Students tab to view student records and open individual
          student details.
        </Text>

        <Link href="/(app)/students" style={styles.link}>
          View Students
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f2f5fa',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17324d',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  welcome: {
    fontSize: 21,
    fontWeight: '600',
    color: '#17324d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17324d',
  },
  text: {
    fontSize: 15,
    color: '#536579',
    lineHeight: 22,
  },
  link: {
    color: '#245bb2',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
