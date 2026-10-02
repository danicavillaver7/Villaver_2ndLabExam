import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_API_BASE_URL } from '@/constants/api';

export default function SignInScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Login failed.');
      }

      const accessToken =
        data?.access_token ??
        data?.accessToken ??
        data?.token;

      if (!accessToken) {
        throw new Error('The login response did not contain an access token.');
      }

      const userData = data?.user ?? {
        id: data?.id,
        name: data?.name,
        email: data?.email ?? email.trim(),
        role: data?.role,
      };

      await login(accessToken, userData);

      router.replace('/(app)');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CCE106 • PRACTICAL EXAMINATION</Text>

        <Text style={styles.title}>Student Service Portal</Text>

        <Text style={styles.subtitle}>
          Sign in to access student services.
        </Text>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          accessibilityLabel="Email"
          placeholder="student@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            accessibilityLabel="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Hide password' : 'Show password'
            }
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#536579"
            />
          </Pressable>
        </View>

        <View style={styles.feedback} accessibilityLiveRegion="polite">
          {loading && (
            <ActivityIndicator
              color="#245bb2"
              accessibilityLabel="Signing in"
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Login'}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          Sign in using your registered account.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/sign-up')}
        >
          <Text style={styles.signUpLink}>Create an account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f2f5fa',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#245bb2',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17324d',
  },
  subtitle: {
    color: '#536579',
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    color: '#17324d',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c6d2e1',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#17324d',
  },
  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#c6d2e1',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#17324d',
  },
  eyeButton: {
    height: '100%',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    minHeight: 28,
  },
  error: {
    color: '#b42318',
  },
  button: {
    backgroundColor: '#245bb2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  note: {
    color: '#536579',
    fontSize: 12,
    marginTop: 20,
  },
  signUpLink: {
    color: '#245bb2',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
});
