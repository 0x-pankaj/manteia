

import { Circle, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useBetStore } from '../../state/betStore';
import { useGridStore } from '../../state/gridStore';
import { getCellCenter } from '../../utils/coords';



const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};
const font = matchFont(fontStyle);


export const BetLayer: React.FC = () => {
  const bets = useBetStore((state) => state.bets);
  const contentOffsetX = useGridStore((state) => state.contentOffsetX);
  const contentOffsetY = useGridStore((state) => state.contentOffsetY);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);

    const [winAnimations, setWinAnimations] = useState<Set<string>>(new Set());


     useEffect(() => {
    // Find newly won bets
    bets.forEach((bet) => {
      if (bet.settled && bet.won && !winAnimations.has(bet.id)) {
        // Add to animation set
        setWinAnimations((prev) => new Set(prev).add(bet.id));
        
        // Remove from animation set after 2 seconds
        setTimeout(() => {
          setWinAnimations((prev) => {
            const newSet = new Set(prev);
            newSet.delete(bet.id);
            return newSet;
          });
        }, 2000);
      }
    });
  }, [bets]);

  const betElements = useMemo(() => {

    return (
    <>
      {bets.map((bet) => {
        const { x, y } = getCellCenter(
          bet.timeIndex,
          bet.priceIndex,
          cellWidth,
          cellHeight,
          contentOffsetX,
          contentOffsetY
        );

        // Determine color based on bet status
        let color = '#ffaa00'; // Pending (orange)
        if (bet.settled) {
          color = bet.won ? "rgba(217, 236, 70, 0.6)" : "rgba(84, 85, 81, 0.6)"; // Win (green) or Loss (red)
        }

           const isAnimating = winAnimations.has(bet.id);

        return (
         <React.Fragment key={bet.id}>
            {/* Win burst effect */}
            {isAnimating && (
              <>
                {/* Outer burst ring 1 */}
                <Circle
                  cx={x}
                  cy={y}
                  r={cellWidth / 2 + 20}
                  color="rgba(241, 248, 187, 0.6)"
                  opacity={0.2}
                />
                {/* Outer burst ring 2 */}
                <Circle
                  cx={x}
                  cy={y}
                  r={cellWidth / 2 + 10}
                  color="rgba(241, 248, 187, 0.6)"
                  opacity={0.4}
                />
                {/* Particles effect - 8 small circles around */}
                {/* {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const distance = cellWidth / 2 + 15;
                  const px = x + Math.cos(rad) * distance;
                  const py = y + Math.sin(rad) * distance;
                  return (
                    <Circle
                      key={`particle-${bet.id}-${angle}`}
                      cx={px}
                      cy={py}
                      r={4}
                      color="#00ff88"
                      opacity={0.8}
                    />
                  );
                })} */}
              </>
            )}

            {/* Outer glow circle */}
            <Circle
              cx={x}
              cy={y}
              r={cellWidth / 3 + 4}
              color={color}
              opacity={0.3}
            />
            
            {/* Main bet circle */}
            <Circle
              cx={x}
              cy={y}
              r={cellWidth / 3}
              color={color}
              opacity={0.8}
            />

            {/* Bet amount text */}
            <SkiaText
              x={x - 15}
              y={y + 5}
              text={`$${bet.stake}`}
              color="#0d0d1f"
              // size={14}
              font={font}
            />
          </React.Fragment>
        );
      })}
    </>
  );

  }, [bets, contentOffsetX, contentOffsetY, cellWidth, cellHeight, winAnimations])

  return <>{betElements}</>;
  
};

