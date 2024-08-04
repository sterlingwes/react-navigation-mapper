// @ts-nocheck
import * as React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const ParentComponent = () => {
  const navigation = useNavigation();

  const ChildComponentA = () => {
    return <View />;
  };

  const ChildComponentB = () => {
    return <ChildComponentA />;
  };

  return (
    <View onPress={() => navigation.push("NextScreen")}>
      <ChildComponentA />
      <ChildComponentB />
    </View>
  );
};
