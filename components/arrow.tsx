import React from "react";
import Svg, { Path } from "react-native-svg";

interface ArrowProps {
  width?: number;
  height?: number;
  color?: string;
}

export const Arrow = ({
  width = 103,
  height = 46,
  color = "#4A2318",
}: ArrowProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 103 46" fill="none">
      <Path
        d="M102.121 25.1213C103.293 23.9497 103.293 22.0503 102.121 20.8787L83.0294 1.7868C81.8579 0.615223 79.9584 0.615223 78.7868 1.7868C77.6152 2.95837 77.6152 4.85786 78.7868 6.02944L95.7574 23L78.7868 39.9706C77.6152 41.1421 77.6152 43.0416 78.7868 44.2132C79.9584 45.3848 81.8579 45.3848 83.0294 44.2132L102.121 25.1213ZM0 26H100V20H0V26Z"
        fill={color}
      />
    </Svg>
  );
};
