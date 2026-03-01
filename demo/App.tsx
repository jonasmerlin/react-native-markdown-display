import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import Markdown from "@ukdanceblue/react-native-markdown-display";
import { useState } from "react";
import Picker from "react-native-picker-select";
import * as Samples from "./sampleFiles";

const sampleList = Object.entries(Samples);

export default function App() {
  const [selectedSample, setSelectedSample] = useState(sampleList[0][1]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Picker
        items={sampleList.map(([key, value]) => ({label: key, value}))}
        onValueChange={(value: string) => {
          setSelectedSample(value);
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "#fff",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          overflow: "scroll",
        }}
      >
        <Text
          style={{
            maxWidth: "50%",
            width: "50%",
            flex: 1,
            fontFamily: "monospace",
          }}
        >
          {selectedSample}
        </Text>
        <Markdown
          style={{
            maxWidth: "50%",
            width: "50%",
            flex: 1,
          }}
        >
          {selectedSample}
        </Markdown>
      </View>
    </View>
  );
}
