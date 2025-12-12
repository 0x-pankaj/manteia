

import { Rect, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { useBetStore } from '../../state/betStore';
import { useGridStore } from '../../state/gridStore';
import { usePriceStore } from '../../state/priceStore';
import { calculateOdds } from '../../utils/odds';

const { width, height } = Dimensions.get('window');


const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};
const font = matchFont(fontStyle);


export const GridLayer: React.FC = () => {
  const contentOffsetX = useGridStore((state) => state.contentOffsetX);
  const contentOffsetY = useGridStore((state) => state.contentOffsetY);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const getCurrentTimeIndex = usePriceStore((state) => state.getCurrentTimeIndex);
  const getCurrentPriceIndex = usePriceStore((state) => state.getCurrentPriceIndex);
  const getBetAtCell = useBetStore((state) => state.getBetAtCell);
  const points =  usePriceStore((state) => state.addPoint);



  const startCol = Math.floor(-contentOffsetX / cellWidth) - 1;
  const endCol = Math.ceil((width - contentOffsetX) / cellWidth) + 1;
  const startRow = Math.floor(-contentOffsetY / cellHeight) - 1;
  const endRow = Math.ceil((height - contentOffsetY) / cellHeight) + 1;

  const currentTimeIndex = getCurrentTimeIndex();
  const currentPriceIndex = getCurrentPriceIndex();

  const elements: React.ReactElement[] = [];

  // Draw grid cells and odds
  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++) {
      const x = col * cellWidth + contentOffsetX;
      const y = row * cellHeight + contentOffsetY;
      
      // Draw cell border
      elements.push(
        <Rect
          key={`odds-${col}-${row}-${points.length}`}
          x={x}
          y={y}
          width={cellWidth}
          height={cellHeight}
          color="rgba(204, 59, 59, 0.05)"
          style="stroke"
          strokeWidth={1}
        />
      );

      // Only show odds for future cells (at least 2 time units ahead)
      if (col > currentTimeIndex + 1) {
        const existingBet = getBetAtCell(col, row);
        
        // Only show odds if no bet exists
        if (!existingBet) {
          const odds = calculateOdds(col, row, currentTimeIndex, currentPriceIndex);
          const oddsText = `${odds.toFixed(1)}x`;
          
          // Center text in cell
          const textX = x + cellWidth / 2 - 15;
          const textY = y + cellHeight / 2 + 5;

          elements.push(
            <SkiaText
              key={`odds-${col}-${row}`}
              x={textX}
              y={textY}
              text={oddsText}
              color="rgba(248, 122, 64, 0.6)"
              font={font}
            />
          );
        }
      }
    }
  }

  return <>{elements}</>;
};

