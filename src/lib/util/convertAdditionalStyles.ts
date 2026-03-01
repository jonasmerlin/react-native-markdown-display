import cssToReactNative, {Style, StyleTuple} from "css-to-react-native";

export default function convertAdditionalStyles(style: string): Style {
  const rules = style.split(";");

  const tuples: StyleTuple[] = rules
    .map((rule): StyleTuple | null => {
      let [key, value] = rule.split(":");

      if (key && value) {
        key = key.trim();
        value = value.trim();
        return [key, value];
      } else {
        return null;
      }
    })
    .filter((x) => {
      return x != null;
    });

  const conv = cssToReactNative(tuples);

  return conv;
}
