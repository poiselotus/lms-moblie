import { Platform, ViewStyle } from "react-native";

export const getShadowStyle = (elevation: number = 5): ViewStyle => {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
    };
  }
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: elevation,
  };
};

export const cardShadow = getShadowStyle(3);
export const buttonShadow = getShadowStyle(2);
