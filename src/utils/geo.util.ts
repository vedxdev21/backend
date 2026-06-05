import { GeoJsonPoint } from '../types/common.types';
/**
 * Create a GeoJSON point from lat/lng
 * Returns a plain object for Prisma Json field storage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createGeoPoint = (lat: number, lng: number): any => ({
  type: 'Point',
  coordinates: [lng, lat], // GeoJSON is [longitude, latitude]
});

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Build MongoDB $near query filter for geospatial queries
 * Used with Prisma's findRaw for location-based results
 */
export const buildNearQuery = (
  lat: number,
  lng: number,
  maxDistanceMeters: number = 10000 // 10km default
) => ({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      $maxDistance: maxDistanceMeters,
    },
  },
});

/**
 * Extract coordinates from a GeoJSON point stored in DB
 */
export const extractCoordinates = (
  location: unknown
): { lat: number; lng: number } | null => {
  try {
    const loc = location as GeoJsonPoint;
    if (loc?.type === 'Point' && Array.isArray(loc.coordinates)) {
      return { lng: loc.coordinates[0], lat: loc.coordinates[1] };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
