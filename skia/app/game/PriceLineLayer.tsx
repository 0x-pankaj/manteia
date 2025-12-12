import { Path, Skia } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { useGridStore } from '../../state/gridStore';
import { usePriceStore } from '../../state/priceStore';
import { priceToY, timeToX } from '../../utils/coords';

export const PriceLineLayer: React.FC = () => {
  const points = usePriceStore((state) => state.points);
  const startTime = usePriceStore((state) => state.startTime);
  const basePrice = usePriceStore((state) => state.basePrice);
  const contentOffsetX = useGridStore((state) => state.contentOffsetX);
  const contentOffsetY = useGridStore((state) => state.contentOffsetY);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);

  const path = useMemo(() => {
    if (points.length < 2) return null;

    const skiaPath = Skia.Path.Make();
    
    // Start from first point
    const firstPoint = points[0];
    const firstX = timeToX(firstPoint.timestamp, startTime, cellWidth, contentOffsetX);
    const firstY = priceToY(firstPoint.price, basePrice, cellHeight, contentOffsetY);
    
    skiaPath.moveTo(firstX, firstY);

    // Draw line through all points
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const x = timeToX(point.timestamp, startTime, cellWidth, contentOffsetX);
      const y = priceToY(point.price, basePrice, cellHeight, contentOffsetY);
      
      skiaPath.lineTo(x, y);
    }

    return skiaPath;
  }, [points, startTime, basePrice, contentOffsetX, contentOffsetY, cellWidth, cellHeight]);

  if (!path) return null;

  return (
    <Path
      path={path}
      // color="#00ff88"
      color="rgba(241, 248, 187, 0.6)"
      style="stroke"
      strokeWidth={1.5}
      strokeCap="round"
      strokeJoin="round"
    />
  );
};