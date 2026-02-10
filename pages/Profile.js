import React, { useContext, useState } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Card, Avatar, Divider } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  const navigation = useNavigation();
  const { userData, user } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePasswordUpdate = () => {
    let isValid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    } else {
      setCurrentPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError('New password must be different from current password');
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordUpdate()) {
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        Alert.alert('🌱 Error', 'No user is signed in.');
        setLoading(false);
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      Alert.alert(
        '🌱 Success',
        'Your password has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Update password error:', error);

      if (error.code === 'auth/wrong-password') {
        Alert.alert('🌱 Incorrect Password', 'Your current password is incorrect.');
        setCurrentPasswordError('Incorrect password');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('🌱 Weak Password', 'Please choose a stronger password.');
        setNewPasswordError('Password is too weak');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          '🌱 Session Expired',
          'For security reasons, please sign in again to update your password.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await auth.signOut();
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              },
            },
          ]
        );
      } else {
        Alert.alert('🌱 Error', 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = () => {
    Alert.alert(
      '🌱 Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) {
                Alert.alert('🌱 Error', 'No user is signed in.');
                return;
              }

              // Delete user document from Firestore
              const userRef = doc(db, 'users', currentUser.uid);
              await deleteDoc(userRef);

              // Delete user from Firebase Auth
              await deleteUser(currentUser);

              Alert.alert(
                '🌱 Account Deleted',
                'Your account has been permanently deleted. We hope to see you again!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'Signup' }],
                        })
                      );
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Delete account failed:', error);

              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  '🌱 Re-authentication Required',
                  'For security reasons, this operation requires a recent sign-in. Please sign in again and try deleting your account.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await auth.signOut();
                        navigation.dispatch(
                          CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                          })
                        );
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  '🌱 Error',
                  'Could not delete account. Please try again later.'
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('🌱 Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOut();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } catch (error) {
            Alert.alert('🌱 Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#43A047', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.profileImageContainer}>
            <Avatar.Text
              size={100}
              label={userData?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              style={styles.avatar}
              color="#fff"
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>
          <Text style={styles.userName}>Hello, {userData?.username || 'User'} 🌱</Text>
          <Text style={styles.userEmail}>{userData?.email || user?.email}</Text>
        </LinearGradient>

        {/* Account Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Account Information</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{userData?.username || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData?.email || user?.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {userData?.createdAt?.toDate
                  ? userData.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Change Password Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Change Password 🔒</Text>
            <Divider style={styles.divider} />

            <View style={styles.inputContainer}>
              <TextInput
                label="Current Password"
                value={currentPassword}
                placeholder="Enter current password"
                secureTextEntry={!passwordVisible}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setCurrentPasswordError('');
                }}
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
                error={!!currentPasswordError}
                disabled={loading}
              />
              {currentPasswordError ? (
                <Text style={styles.errorText}>{currentPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="New Password"
                value={newPassword}
                placeholder="Enter new password"
                secureTextEntry={!newPasswordVisible}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewPasswordError('');
                }}
                left={<TextInput.Icon icon="lock-reset" color="#43A047" />}
                right={
                  <TextInput.Icon
                    icon={newPasswordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setNewPasswordVisible(!newPasswordVisible)}
                    color="#43A047"
                  />
                }
                style={styles.input}
                mode="outlined"
                outlineColor="#C8E6C9"
                activeOutlineColor="#43A047"
                error={!!newPasswordError}
                disabled={loading}
              />
              {newPasswordError ? (
                <Text style={styles.errorText}>{newPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                placeholder="Re-enter new password"
                secureTextEntry={!confirmPasswordVisible}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
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
            </View>

            <Button
              mode="contained"
              onPress={handleUpdatePassword}
              style={styles.updateButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Account Actions</Text>
            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.signOutButtonLabel}
              icon="logout"
            >
              Sign Out
            </Button>

            <Button
              mode="contained"
              onPress={deleteAccount}
              style={styles.deleteButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="delete-outline"
            >
              Delete Account
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>🌱 LeafCare 🌱</Text>
          <Text style={styles.footerText}>
            This is an AI-powered Plant Care App. We value your privacy and do not
            share your personal information.
          </Text>
          <Text style={styles.footerContact}>
            For support: info@leafcare.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarLabel: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F8F4',
  },
  infoLabel: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
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
  updateButton: {
    backgroundColor: '#43A047',
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    borderColor: '#43A047',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  signOutButtonLabel: {
    color: '#43A047',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 10,
  },
  footerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#66BB6A',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerContact: {
    textAlign: 'center',
    fontSize: 12,
    color: '#43A047',
    fontWeight: '600',
  },
});