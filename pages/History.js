import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Image,
  ActivityIndicator
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function History() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "history"),
        where("userId", "==", auth.currentUser.uid),
      );
      const snap = await getDocs(q);
      const historyData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const HistoryCard = ({ item }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.diseaseContainer}>
            <Icon name="medical-services" size={24} color="#2E7D32" />
            <Text style={styles.diseaseText} numberOfLines={1}>
              {item.disease || "Unknown Disease"}
            </Text>
          </View>
          
          <Icon
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color="#4CAF50"
          />
        </View>

        <View style={styles.dateContainer}>
          <Icon name="calendar-today" size={16} color="#81C784" />
          <Text style={styles.dateText}>
            {formatDate(item.timestamp)}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="description" size={20} color="#2E7D32" />
                <Text style={styles.sectionTitle}>Summary</Text>
              </View>
              <Text style={styles.sectionContent}>{item.summary || "No summary available"}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="healing" size={20} color="#2E7D32" />
                <Text style={styles.sectionTitle}>Treatment</Text>
              </View>
              <Text style={styles.sectionContent}>{item.treatment || "No treatment details available"}</Text>
            </View>

            {item.severity && (
              <View style={styles.severityContainer}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(item.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    Severity: {item.severity}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {!isExpanded && (
          <Text style={styles.previewText} numberOfLines={2}>
            {item.summary || "No summary available"}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'low': return '#C8E6C9';
      case 'medium': return '#FFE082';
      case 'high': return '#FFAB91';
      default: return '#E0E0E0';
    }
  };

  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your health history...</Text>
      </SafeAreaView>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Icon name="history" size={80} color="#C8E6C9" />
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptyText}>
          Your health diagnosis history will appear here
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadHistory}>
          <Icon name="refresh" size={20} color="#FFF" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health History</Text>
        <Text style={styles.headerSubtitle}>
          {history.length} diagnosis{history.length !== 1 ? 'es' : ''} recorded
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8E9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#388E3C",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 5,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  diseaseContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  diseaseText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 12,
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#81C784",
    marginLeft: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8F5E9",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 22,
    backgroundColor: "#F9FDF9",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  severityContainer: {
    marginTop: 10,
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B5E20",
  },
  separator: {
    height: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  refreshButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});