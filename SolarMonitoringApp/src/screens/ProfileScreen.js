import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image,
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api';
import Header from '../components/Header';
import Colors from '../constants/Colors';
import Icon from '../components/Icon';

export default function ProfileScreen() {
  const { logout, userToken } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    if (!userToken) {
      setIsLoading(false);
      return;
    }
    const profile = await getUserProfile(userToken);
    setUser(profile);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [userToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluar", 
          style: "destructive",
          onPress: () => logout() 
        }
      ]
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Profil Pengguna" subtitle="Pengaturan Akun" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat profil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profil Pengguna" subtitle="Pengaturan Akun" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Image 
              source={require('../../assets/profile-default.jpg')}
              style={styles.avatarImage}
            />
            <Text style={styles.name}>
              {user?.full_name || 'Pengguna'}
            </Text>
            <Text style={styles.role}>
              {user?.is_active ? 'Akun Aktif' : 'Akun Nonaktif'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informasi Akun</Text>
            
            <View style={styles.infoRow}>
              <Icon name="user" size={16} color={Colors.textMuted} />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{user?.username || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="mail" size={16} color={Colors.textMuted} />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="calendar" size={16} color={Colors.textMuted} />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Bergabung</Text>
                <Text style={styles.infoValue}>{formatDate(user?.created_at)}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Icon name="clock" size={16} color={Colors.textMuted} />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Login Terakhir</Text>
                <Text style={styles.infoValue}>{formatDate(user?.last_login_at)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Keluar (Logout)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  role: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  }
});