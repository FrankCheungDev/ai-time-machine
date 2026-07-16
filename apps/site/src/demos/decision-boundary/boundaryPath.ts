const outlierMinY = 78;
const outlierMaxY = 260;
const outlierMidY = (outlierMinY + outlierMaxY) / 2;
const outlierRadius = (outlierMaxY - outlierMinY) / 2;

function clampOutlierY(outlierY: number): number {
  return Math.min(outlierMaxY, Math.max(outlierMinY, outlierY));
}

export function getBoundaryPath(modeId: string, outlierY: number): string {
  const clampedY = clampOutlierY(outlierY);
  const influence = (clampedY - outlierMidY) / outlierRadius;

  if (modeId === "linear") {
    const topX = Math.round(330 + influence * 18);
    const bottomX = Math.round(330 - influence * 18);

    return `M${topX} 54 L${bottomX} 316`;
  }

  if (modeId === "nonlinear") {
    const firstControlX = Math.round(250 + influence * 14);
    const secondControlX = Math.round(392 + influence * 18);
    const endX = Math.round(332 - influence * 28);

    return `M300 48 C${firstControlX} 140 ${secondControlX} 184 ${endX} 318`;
  }

  const bendY = Math.round(clampedY - 20);
  const exitControlX = Math.round(510 + influence * 24);

  return `M250 44 C396 78 236 152 388 198 C430 214 438 ${bendY} 470 ${bendY} S${exitControlX} 278 456 326`;
}
