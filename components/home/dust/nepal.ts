// A simplified outline of Nepal as [longitude, latitude] pairs, clockwise from
// the far-west corner. Hand-traced from the country's border (≈70 points), so
// it reads as Nepal at dot-cloud resolution: the narrow western panhandle, the
// Mustang bulge on the northern border, the long Terai edge in the south and
// the Mechi/Kanchenjunga corner in the east.
export const NEPAL: [number, number][] = [
  // western border (Mahakali river), north → south
  [80.62, 30.32], [80.48, 30.1], [80.4, 29.85], [80.3, 29.6], [80.22, 29.35], [80.12, 29.1], [80.06, 28.9],
  // southern border (Terai), west → east
  [80.2, 28.68], [80.45, 28.6], [80.75, 28.5], [81.0, 28.4], [81.3, 28.2], [81.62, 28.05], [81.9, 27.95],
  [82.2, 27.86], [82.5, 27.72], [82.8, 27.62], [83.05, 27.52], [83.4, 27.46], [83.75, 27.42], [84.05, 27.4],
  [84.35, 27.33], [84.62, 27.2], [84.88, 27.0], [85.1, 26.86], [85.35, 26.76], [85.62, 26.84], [85.92, 26.7],
  [86.2, 26.62], [86.5, 26.56], [86.8, 26.5], [87.1, 26.38], [87.4, 26.42], [87.7, 26.48], [88.0, 26.52],
  // eastern border (Mechi river, Singalila ridge), south → north
  [88.16, 26.68], [88.12, 26.92], [88.02, 27.1], [88.03, 27.3], [88.1, 27.52], [88.17, 27.72], [88.1, 27.86],
  // northern border (Tibet), east → west
  [87.82, 27.92], [87.55, 27.84], [87.3, 27.9], [87.0, 27.95], [86.7, 28.08], [86.4, 28.02], [86.1, 27.98],
  [85.85, 28.12], [85.6, 28.28], [85.3, 28.42], [85.0, 28.58], [84.7, 28.7], [84.4, 28.78], [84.15, 28.92],
  [84.0, 29.1], [83.95, 29.32], [83.7, 29.28], [83.4, 29.38], [83.1, 29.52], [82.8, 29.72], [82.5, 29.9],
  [82.2, 30.06], [81.9, 30.18], [81.6, 30.3], [81.3, 30.2], [81.05, 30.1], [80.85, 30.18],
];

/** Kathmandu, [longitude, latitude]. */
export const KATHMANDU: [number, number] = [85.32, 27.71];

/**
 * Projects [lon, lat] to unit-square [x, y] (y down) with the aspect ratio
 * Nepal has on a map at its own latitude (longitudes shrink by cos 28°).
 */
export function projectNepal([lon, lat]: [number, number]): [number, number] {
  const lon0 = 80.0, lon1 = 88.25, lat0 = 26.3, lat1 = 30.45;
  const k = Math.cos((28.4 * Math.PI) / 180);
  const w = (lon1 - lon0) * k, h = lat1 - lat0;
  return [((lon - lon0) * k) / w, 1 - (lat - lat0) / h];
}

/** Width ÷ height of the projected outline (≈1.74). */
export const NEPAL_ASPECT = ((88.25 - 80.0) * Math.cos((28.4 * Math.PI) / 180)) / (30.45 - 26.3);
