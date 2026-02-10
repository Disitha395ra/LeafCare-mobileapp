import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Banner() {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace('AuthGate');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../assets/images/cover-starter.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(46, 125, 50, 0.7)', 'rgba(27, 94, 32, 0.85)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.gradientOverlay}
      />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
        </Animated.View>

        {/* Animated Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome to LeafCare</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Your Plant's Best Friend</Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📸</Text>
              <Text style={styles.featureText}>Scan plant leaves</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Detect diseases</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>Get solutions</Text>
            </View>
          </View>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Loading your garden...</Text>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <Animated.View
        style={[
          styles.decorativeLeaf1,
          {
            opacity: fadeAnim,
            transform: [
              {
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '15deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.decorativeEmoji}>🍃</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.decorativeLeaf2,
          {
            opacity: fadeAnim,
            transform: [
              {
                rotate: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-15deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.decorativeEmoji}>🌿</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#66BB6A',
    borderRadius: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#C8E6C9',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  featureDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#E8F5E9',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width - 80,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#66BB6A',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#C8E6C9',
    fontWeight: '500',
  },
  decorativeLeaf1: {
    position: 'absolute',
    top: 100,
    left: 30,
    opacity: 0.6,
  },
  decorativeLeaf2: {
    position: 'absolute',
    top: 150,
    right: 30,
    opacity: 0.6,
  },
  decorativeEmoji: {
    fontSize: 40,
  },
});