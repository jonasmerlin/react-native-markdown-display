import {ViewStyle} from "react-native";
import textStyleProps from "../data/textStyleProps";

export default function removeTextStyleProps(style: ViewStyle): ViewStyle {
  const intersection = textStyleProps.filter((value) =>
    Object.keys(style).includes(value),
  );

  const obj = {...style};

  intersection.forEach((value) => {
    // @ts-expect-error this is fine
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[value];
  });

  return obj;
}
