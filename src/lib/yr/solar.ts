const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export type SolarPosition = {
  elevation: number;
  azimuth: number;
};

export function getSolarPosition(
  latitude: number,
  longitude: number,
  date: Date,
): SolarPosition {
  const jd = toJulianDay(date);
  const n = jd - 2451545.0;
  const meanLongitude = normalizeAngle(280.46 + 0.9856474 * n);
  const meanAnomaly = normalizeAngle(357.528 + 0.9856003 * n);
  const eclipticLongitude = normalizeAngle(
    meanLongitude +
      1.915 * Math.sin(meanAnomaly * DEG) +
      0.02 * Math.sin(2 * meanAnomaly * DEG),
  );
  const obliquity = 23.439 - 0.0000004 * n;

  const sinElevation =
    Math.sin(latitude * DEG) * Math.sin(eclipticLongitude * DEG) +
    Math.cos(latitude * DEG) *
      Math.cos(eclipticLongitude * DEG) *
      Math.cos(obliquity * DEG);

  const elevation = Math.asin(sinElevation) * RAD;

  const hourAngle = normalizeHourAngle(date, longitude);
  const azimuth =
    Math.atan2(
      -Math.sin(hourAngle * DEG),
      Math.tan(obliquity * DEG) * Math.cos(latitude * DEG) -
        Math.sin(latitude * DEG) * Math.cos(hourAngle * DEG),
    ) * RAD;

  return {
    elevation: Math.round(elevation * 10) / 10,
    azimuth: (azimuth + 360) % 360,
  };
}

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function normalizeHourAngle(date: Date, longitude: number): number {
  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;
  return normalizeAngle((utcHours - 12) * 15 + longitude);
}

export function isSunUp(elevation: number): boolean {
  return elevation > 0;
}
