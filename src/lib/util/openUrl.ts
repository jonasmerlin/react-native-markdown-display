import {Linking} from "react-native";

export default function openUrl(
  url: string,
  customCallback?: (url: string) => boolean,
): void {
  if (customCallback) {
    const result = customCallback(url);
    if (url && result && typeof result === "boolean") {
      Linking.openURL(url).catch((err: unknown) => {
        console.warn(err);
      });
    }
  } else if (url) {
    Linking.openURL(url).catch((err: unknown) => {
      console.warn(err);
    });
  }
}
