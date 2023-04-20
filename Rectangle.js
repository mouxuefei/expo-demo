// Packages Imports
import { View, StyleSheet } from "react-native";

// Local Imports

// function component for Rectangle
function Rectangle(props) {
  // Destructuring props
  const { face } = props;

  const rectangleStyle = [
    styles.container,
    {
      width: face?.bounds?.size?.width ?? 0,
      height: face?.bounds?.size?.height ?? 0,
      top: face?.bounds?.origin?.y ?? 0,
      left: face?.bounds?.origin?.x ?? 0,
    },
  ];

  // render
  return <View style={rectangleStyle}></View>;
}

// exports
export default Rectangle;

// styles
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "red",
    position: "absolute",
  },
});
