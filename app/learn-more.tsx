import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LearnMoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Ionicons name="information-circle" size={60} color="#007AFF" />
            <Text style={styles.title}>About My Allowance</Text>
            <Text style={styles.subtitle}>
              Your personal budget tracking companion
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 What is My Allowance?</Text>
            <Text style={styles.sectionText}>
              My Allowance is a simple yet powerful budget tracking app designed
              to help you manage your monthly expenses effectively. Set budget
              categories, track spending, and stay on top of your financial
              goals.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Key Features</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="wallet" size={20} color="#007AFF" />
                <Text style={styles.featureText}>
                  Create custom budget categories (Food, Transportation,
                  Entertainment, etc.)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={20} color="#28a745" />
                <Text style={styles.featureText}>
                  Track your spending against budget limits
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="calendar" size={20} color="#ff6b35" />
                <Text style={styles.featureText}>
                  Monthly budget management and reporting
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="phone-portrait" size={20} color="#6f42c1" />
                <Text style={styles.featureText}>
                  Simple, intuitive mobile interface
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color="#20c997" />
                <Text style={styles.featureText}>
                  Secure local data storage - your data stays on your device
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Getting Started</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Set Up Your Budget</Text>
                  <Text style={styles.stepDescription}>
                    Create categories like Food, Transportation, Shopping, and
                    set monthly budget amounts for each.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Track Your Expenses</Text>
                  <Text style={styles.stepDescription}>
                    Add expenses to the appropriate categories as you spend
                    throughout the month.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Monitor Progress</Text>
                  <Text style={styles.stepDescription}>
                    View your spending reports and see how well you're sticking
                    to your budget.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Adjust & Improve</Text>
                  <Text style={styles.stepDescription}>
                    Edit your budget categories and amounts as your needs change
                    over time.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💰 Budget Categories Examples
            </Text>
            <View style={styles.examplesList}>
              <View style={styles.exampleCategory}>
                <Text style={styles.exampleName}>🍔 Food & Dining</Text>
                <Text style={styles.exampleAmount}>₹8,000/month</Text>
              </View>
              <View style={styles.exampleCategory}>
                <Text style={styles.exampleName}>🚗 Transportation</Text>
                <Text style={styles.exampleAmount}>₹3,500/month</Text>
              </View>
              <View style={styles.exampleCategory}>
                <Text style={styles.exampleName}>🎬 Entertainment</Text>
                <Text style={styles.exampleAmount}>₹2,000/month</Text>
              </View>
              <View style={styles.exampleCategory}>
                <Text style={styles.exampleName}>🛒 Shopping</Text>
                <Text style={styles.exampleAmount}>₹5,000/month</Text>
              </View>
              <View style={styles.exampleCategory}>
                <Text style={styles.exampleName}>💊 Healthcare</Text>
                <Text style={styles.exampleAmount}>₹1,500/month</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy & Security</Text>
            <Text style={styles.sectionText}>
              Your financial data is stored securely on your device using
              encrypted local storage. We don't collect, store, or share your
              personal financial information with any third parties. Your budget
              data remains completely private and under your control.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Tips for Success</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>
                • Set realistic budget amounts based on your actual spending
                patterns
              </Text>
              <Text style={styles.tipItem}>
                • Update your expenses regularly for accurate tracking
              </Text>
              <Text style={styles.tipItem}>
                • Review your budget monthly and adjust categories as needed
              </Text>
              <Text style={styles.tipItem}>
                • Use specific category names to better organize your spending
              </Text>
              <Text style={styles.tipItem}>
                • Include both fixed expenses (rent, utilities) and variable
                expenses (food, entertainment)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={styles.getStartedButtonText}>Get Started Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  examplesList: {
    gap: 12,
  },
  exampleCategory: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  exampleName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  exampleAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007AFF",
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
