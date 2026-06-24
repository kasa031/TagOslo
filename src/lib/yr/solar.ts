const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export type SolarPosition = {
  elevation: number;
  azimuth: number;
};

/**
 * Solposisjon (elevasjon + azimut) for et gitt tidspunkt.
 * Elevasjon tar hensyn til klokkeslett via timevinkel – avgjør om solen er oppe.
 */
export function getSolarPosition(
  latitude: number,
  longitude: number,
  date: Date,
): SolarPosition {
  const lat = latitude * DEG;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;

  const meanLongitude = normalizeAngle(280.46 + 0.9856474 * n);
  const meanAnomaly = normalizeAngle(357.528 + 0.9856003 * n) * DEG;
  const eclipticLongitude =
    (meanLongitude +
      1.915 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly)) *
    DEG;
  const obliquity = (23.439 - 0.0000004 * n) * DEG;

  const declination = Math.asin(
    Math.sin(obliquity) * Math.sin(eclipticLongitude),
  );

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600 +
    date.getUTCMilliseconds() / 3600000;
  const solarTimeHours = utcHours + longitude / 15;
  const hourAngle = (solarTimeHours - 12) * 15 * DEG;

  const sinElevation =
    Math.sin(lat) * Math.sin(declination) +
    Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const elevation =
    Math.asin(clamp(sinElevation, -1, 1)) * RAD;

  const cosAzimuth =
    (Math.sin(declination) - Math.sin(lat) * sinElevation) /
    (Math.cos(lat) * Math.cos(Math.asin(clamp(sinElevation, -1, 1))) || 1);
  let azimuth = Math.acos(clamp(cosAzimuth, -1, 1)) * RAD;
  if (Math.sin(hourAngle) > 0) {
    azimuth = 360 - azimuth;
  }

  return {
    elevation: Math.round(elevation * 10) / 10,
    azimuth: Math.round(azimuth * 10) / 10,
  };
}

function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isSunUp(elevation: number): boolean {
  return elevation > 0;
}
