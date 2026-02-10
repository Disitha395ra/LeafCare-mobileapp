import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

export default function Signup() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [passwordStrengthColor, setPasswordStrengthColor] = useState('#E0E0E0');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateUsername = (username) => {
    if (!username) {
      setUsernameError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordStrengthText('');
      setPasswordStrengthColor('#E0E0E0');
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 0.2;
    if (password.length >= 8) strength += 0.1;
    if (password.length >= 12) strength += 0.1;

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 0.15;
    if (/[A-Z]/.test(password)) strength += 0.15;
    if (/[0-9]/.test(password)) strength += 0.15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 0.15;

    setPasswordStrength(strength);

    if (strength < 0.3) {
      setPasswordStrengthText('Weak');
      setPasswordStrengthColor('#F44336');
    } else if (strength < 0.6) {
      setPasswordStrengthText('Fair');
      setPasswordStrengthColor('#FF9800');
    } else if (strength < 0.8) {
      setPasswordStrengthText('Good');
      setPasswordStrengthColor('#43A047');
    } else {
      setPasswordStrengthText('Strong');
      setPasswordStrengthColor('#2E7D32');
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPass) => {
    if (!confirmPass) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    // Validate all fields
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });

      Alert.alert(
        '🌱 Welcome to LeafCare!',
        `Your account has been created successfully, ${username}!`,
        [{ text: 'Get Started', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      handleFirebaseError(error.code);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (code) => {
    console.log('Firebase error code:', code);

    switch (code) {
      case 'auth/email-already-in-use':
        Alert.alert(
          '🌱 Email Already Registered',
          'This email is already associated with an account. Please sign in instead.',
          [
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setEmailError('Email already in use');
        break;

      case 'auth/invalid-email':
        Alert.alert('🌱 Invalid Email', 'Please enter a valid email address.');
        setEmailError('Invalid email format');
        break;

      case 'auth/weak-password':
        Alert.alert(
          '🌱 Weak Password',
          'Please choose a stronger password (at least 6 characters).'
        );
        setPasswordError('Password is too weak');
        break;

      case 'auth/network-request-failed':
        Alert.alert(
          '🌱 Network Error',
          'Please check your internet connection and try again.'
        );
        break;

      default:
        Alert.alert('🌱 Signup Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={['#2E7D32', '#43A047', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🌱</Text>
              </View>
              <Text style={styles.appName}>Join LeafCare</Text>
              <Text style={styles.tagline}>Start your plant care journey</Text>
            </Animated.View>
          </LinearGradient>

          {/* Form Container */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Create Account 🌿</Text>
              <Text style={styles.welcomeSubtitle}>
                Fill in the details to get started
              </Text>
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Username"
                value={username}
                placeholder="Choose a username"
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                }}
                onBlur={() => validateUsername(username)}
                autoCapitalize="none"
                autoCorrect={false}
                left={<TextInput.Icon icon="account-outline" color="#43A047" />}
                style={styles.input}
                mode="outlined"
                outlineColor="#C8E6C9"
                activeOutlineColor="#43A047"
                error={!!usernameError}
                disabled={loading}
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={email}
                placeholder="Enter your email"
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                left={<TextInput.Icon icon="email-outline" color="#43A047" />}
                style={styles.input}
                mode="outlined"
                outlineColor="#C8E6C9"
                activeOutlineColor="#43A047"
                error={!!emailError}
                disabled={loading}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                value={password}
                placeholder="Create a password"
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                  calculatePasswordStrength(text);
                }}
                onBlur={() => validatePassword(password)}
                left={<TextInput.Icon icon="lock-outline" color="#43A047" />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    color="#43A047"
                  />
                }
                style={styles.input}
                mode="outlined"
                outlineColor="#C8E6C9"
                activeOutlineColor="#43A047"
                error={!!passwordError}
                disabled={loading}
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              
              {/* Password Strength Indicator */}
              {password && !passwordError ? (
                <View style={styles.passwordStrengthContainer}>
                  <ProgressBar
                    progress={passwordStrength}
                    color={passwordStrengthColor}
                    style={styles.progressBar}
                  />
                  <Text style={[styles.strengthText, { color: passwordStrengthColor }]}>
                    {passwordStrengthText}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry={!confirmPasswordVisible}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                left={<TextInput.Icon icon="lock-check-outline" color="#43A047" />}
                right={
                  <TextInput.Icon
                    icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    color="#43A047"
                  />
                }
                style={styles.input}
                mode="outlined"
                outlineColor="#C8E6C9"
                activeOutlineColor="#43A047"
                error={!!confirmPasswordError}
                disabled={loading}
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
              {confirmPassword && !confirmPasswordError && password === confirmPassword ? (
                <View style={styles.matchContainer}>
                  <Text style={styles.matchText}>✓ Passwords match</Text>
                </View>
              ) : null}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Signup Button */}
            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.signupButton}
              contentStyle={styles.signupButtonContent}
              labelStyle={styles.signupButtonLabel}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Text style={styles.decorativeLeaf}>🌿</Text>
            <Text style={styles.decorativeLeaf}>🍃</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#66BB6A',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  strengthText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  matchContainer: {
    marginTop: 4,
    marginLeft: 12,
  },
  matchText: {
    color: '#43A047',
    fontSize: 12,
    fontWeight: '600',
  },
  termsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#81C784',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#43A047',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#43A047',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  signupButtonContent: {
    paddingVertical: 8,
  },
  signupButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#66BB6A',
    fontSize: 14,
  },
  loginLink: {
    color: '#43A047',
    fontSize: 14,
    fontWeight: '700',
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 20,
    opacity: 0.3,
  },
  decorativeLeaf: {
    fontSize: 30,
  },
});