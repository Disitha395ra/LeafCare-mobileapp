import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Searchbar, Chip, Avatar, IconButton } from 'react-native-paper';
import { AuthContext } from '../AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user, userData } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);

  const categories = ['All', 'Plant Care', 'Diseases', 'Watering', 'Fertilizing', 'Pruning', 'Tips'];

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, selectedCategory, articles]);

  const fetchArticles = async () => {
    try {
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'articles'));
      
      if (querySnapshot.empty) {
        setArticles([]);
        setFilteredArticles([]);
        setLoading(false);
        return;
      }

      const articlesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by creation date (newest first)
      articlesList.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setArticles(articlesList);
      setFilteredArticles(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again.');
      Alert.alert(
        '🌱 Error',
        'Unable to fetch articles. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (article) =>
          article.category &&
          article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (article) =>
          article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'plant care': '#4CAF50',
      diseases: '#FF6B6B',
      watering: '#42A5F5',
      fertilizing: '#FFA726',
      pruning: '#AB47BC',
      tips: '#26C6DA',
    };
    return colors[category?.toLowerCase()] || '#66BB6A';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#2E7D32', '#43A047', '#66BB6A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()} 🌱</Text>
          <Text style={styles.username}>{userData?.username || user?.email?.split('@')[0]}</Text>
        </View>
        <Avatar.Text
          size={50}
          label={userData?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          style={styles.avatar}
          color="#fff"
          labelStyle={styles.avatarLabel}
        />
      </View>

      <Text style={styles.headerSubtitle}>
        Discover tips and insights for healthier plants
      </Text>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search articles..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#43A047"
        placeholderTextColor="#81C784"
        inputStyle={styles.searchInput}
      />
    </View>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          selected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.categoryChipSelected,
          ]}
          textStyle={[
            styles.categoryText,
            selectedCategory === category && styles.categoryTextSelected,
          ]}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          selectedColor="#fff"
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderArticleCard = (article) => (
    <Card key={article.id} style={styles.articleCard} elevation={2}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.articleHeader}>
          <View style={styles.articleTitleContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(article.category) },
              ]}
            >
              <Text style={styles.categoryBadgeText}>
                {article.category || 'General'}
              </Text>
            </View>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {article.title || 'Untitled Article'}
            </Text>
          </View>
        </View>

        <Text style={styles.articleSummary} numberOfLines={3}>
          {article.summary || 'No summary available.'}
        </Text>

        <View style={styles.articleFooter}>
          <View style={styles.dateContainer}>
            <IconButton icon="calendar-outline" size={16} iconColor="#81C784" style={styles.iconSmall} />
            <Text style={styles.dateText}>{formatDate(article.createdAt)}</Text>
          </View>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
            <IconButton icon="arrow-right" size={16} iconColor="#43A047" style={styles.iconSmall} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌿</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedCategory !== 'All'
          ? 'No articles found'
          : 'No articles yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCategory !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Articles will appear here once added'}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>🌾</Text>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchArticles}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#43A047" />
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#43A047']}
            tintColor="#43A047"
          />
        }
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderCategories()}

        <View style={styles.articlesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Articles' : selectedCategory}
            </Text>
            <Text style={styles.articleCount}>
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            </Text>
          </View>

          {error ? (
            renderErrorState()
          ) : filteredArticles.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredArticles.map(renderArticleCard)
          )}
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 15,
  },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderColor: '#C8E6C9',
  },
  categoryChipSelected: {
    backgroundColor: '#43A047',
  },
  categoryText: {
    color: '#43A047',
    fontSize: 13,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  articleCount: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: '500',
  },
  articleCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  cardContent: {
    padding: 16,
  },
  articleHeader: {
    marginBottom: 12,
  },
  articleTitleContainer: {
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    lineHeight: 24,
  },
  articleSummary: {
    fontSize: 14,
    color: '#558B2F',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSmall: {
    margin: 0,
    padding: 0,
  },
  dateText: {
    fontSize: 12,
    color: '#81C784',
    marginLeft: -4,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 13,
    color: '#43A047',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#81C784',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#43A047',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#81C784',
  },
  footerSpacing: {
    height: 20,
  },
});