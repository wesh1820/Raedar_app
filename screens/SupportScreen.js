import React, { useState } from "react";
import { Linking } from "react-native";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  { question: "What is Raedar?", answer: "Raedar is a parking tool..." },
  { question: "How to pay?", answer: "You can pay by card or app..." },
  {
    question: "How to know where the timer is?",
    answer: "Check your dashboard...",
  },
  {
    question: "How to update my timer?",
    answer: "Tap the timer and choose new time.",
  },
  { question: "How to select a slot?", answer: "Select from the slot list." },
  {
    question: "How to stop my parking?",
    answer: "Tap 'Stop' in your active session.",
  },
];

const SupportScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const filteredData = FAQ_DATA.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backArrow}>
        <Ionicons name="arrow-back" size={26} color="#001D3D" />
      </TouchableOpacity> */}

      <Text style={styles.title}>Support</Text>
      <Text style={styles.subtitle}>
        We’re here to help you with <Text style={styles.orange}>anything</Text>{" "}
        and <Text style={styles.orange}>everything</Text>.
      </Text>

      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#62718E"
          style={{ marginLeft: 10 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#62718E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons
          name="mic"
          size={20}
          color="#62718E"
          style={{ marginRight: 10 }}
        />
      </View>

      <Text style={styles.faqHeader}>FAQ</Text>
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => toggleExpand(index)}
            style={styles.faqItem}
          >
            <View style={styles.faqRow}>
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={expandedIndex === index ? "remove" : "add"}
                size={24}
                color="#001D3D"
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => Linking.openURL("https://raedar.be/#contact-us")}
      >
        <Text style={styles.messageText}>Send a Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9faff",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backArrow: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#001D3D",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    color: "#001D3D",
    marginBottom: 24,
  },
  orange: {
    color: "#EB6534",
    fontWeight: "bold",
  },
  searchBar: {
    backgroundColor: "#f0f4f8",
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#001D3D",
  },
  faqHeader: {
    fontWeight: "bold",
    color: "#001D3D",
    fontSize: 16,
    marginBottom: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 14,
  },
  faqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    color: "#62718E",
    fontWeight: "600",
    flex: 1,
  },
  answer: {
    color: "#62718E",
    marginTop: 8,
    fontSize: 15,
  },
  messageButton: {
    backgroundColor: "#001D3D",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 18,
    marginTop: 24,
    marginBottom: 70,
  },
  messageText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default SupportScreen;
