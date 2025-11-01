export function generateDistinctColors(count: number): string[] {
  const colors: string[] = [];
  const saturation = 70;
  const lightness = 75;

  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

export function getTextColor(backgroundColor: string): string {
  const hslMatch = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hslMatch) return '#000';

  const lightness = parseInt(hslMatch[3]);
  return lightness > 60 ? '#000' : '#fff';
}
