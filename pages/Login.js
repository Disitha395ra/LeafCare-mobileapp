import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handleLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('🌱 Success', 'Welcome back to LeafCare!', [
        { text: 'Continue', onPress: () => navigation.navigate('BottomTabs') },
      ]);
    } catch (error) {
      handleFirebaseError(error.code);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (code) => {
    console.log('Firebase error code:', code);

    switch (code) {
      case 'auth/user-not-found':
        Alert.alert(
          '🌱 Account Not Found',
          'This email is not registered. Would you like to create an account?',
          [
            { text: 'Go to Signup', onPress: () => navigation.navigate('Signup') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        break;

      case 'auth/wrong-password':
        Alert.alert(
          '🌱 Incorrect Password',
          'The password you entered is incorrect. Please try again or reset your password.'
        );
        setPasswordError('Incorrect password');
        break;

      case 'auth/invalid-email':
        Alert.alert('🌱 Invalid Email', 'Please enter a valid email address.');
        setEmailError('Invalid email format');
        break;

      case 'auth/invalid-credential':
        Alert.alert(
          '🌱 Login Failed',
          'Email or password is incorrect. Please check your credentials.',
          [
            { text: 'Try Again', style: 'cancel' },
            { text: 'Create Account', onPress: () => navigation.navigate('Signup') },
          ]
        );
        break;

      case 'auth/too-many-requests':
        Alert.alert(
          '🌱 Too Many Attempts',
          'Too many failed login attempts. Please try again later or reset your password.'
        );
        break;

      case 'auth/network-request-failed':
        Alert.alert(
          '🌱 Network Error',
          'Please check your internet connection and try again.'
        );
        break;

      default:
        Alert.alert('🌱 Login Error', 'Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('🌱 Email Required', 'Please enter your email address first.');
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    Alert.alert(
      '🌱 Reset Password',
      `Send password reset link to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            sendPasswordResetEmail(auth, email)
              .then(() => {
                Alert.alert(
                  '🌱 Email Sent',
                  'A password reset link has been sent to your email. Please check your inbox.'
                );
              })
              .catch((error) => {
                if (error.code === 'auth/user-not-found') {
                  Alert.alert(
                    '🌱 User Not Found',
                    'This email is not registered. Please create an account.',
                    [
                      {
                        text: 'Create Account',
                        onPress: () => navigation.navigate('Signup'),
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                } else if (error.code === 'auth/invalid-email') {
                  Alert.alert('🌱 Invalid Email', 'Please enter a valid email address.');
                } else {
                  Alert.alert('🌱 Error', 'Failed to send reset email. Please try again.');
                }
              });
          },
        },
      ]
    );
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
              <Text style={styles.appName}>LeafCare</Text>
              <Text style={styles.tagline}>Your Plant's Best Friend</Text>
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
              <Text style={styles.welcomeTitle}>Welcome Back! 🌿</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue caring for your plants
              </Text>
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
                placeholder="Enter your password"
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
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
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => navigation.navigate('GoogleLogin')}
              disabled={loading}
            >
              <Image
                source={require('../assets/images/google.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                disabled={loading}
              >
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Text style={styles.decorativeLeaf}>🍃</Text>
            <Text style={styles.decorativeLeaf}>🌿</Text>
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
    paddingBottom: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 45,
  },
  appName: {
    fontSize: 32,
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
    marginBottom: 32,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#43A047',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#43A047',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#C8E6C9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#81C784',
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#66BB6A',
    fontSize: 14,
  },
  signupLink: {
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