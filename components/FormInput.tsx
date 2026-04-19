import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import Colors from "../constants/Colors";

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  colorScheme?: "light" | "dark";
  value: string;
  onChangeText: (text: string) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  iconName,
  colorScheme = "light",
  value,
  onChangeText,
  ...props
}) => {
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {iconName && (
          <Ionicons name={iconName} size={20} color={colors.textSecondary} />
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          {...props}
          placeholderTextColor={colors.textSecondary}
          autoCorrect={false}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormInput;
