import { styles } from "@/assets/styles/learn-more.style";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
