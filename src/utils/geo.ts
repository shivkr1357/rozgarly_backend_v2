export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(point2.latitude - point1.latitude);
  const dLon = deg2rad(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) *
      Math.cos(deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Calculate bounding box for a given point and radius
 * @param center Center point
 * @param radiusKm Radius in kilometers
 * @returns Bounding box coordinates
 */
export const calculateBoundingBox = (center: GeoPoint, radiusKm: number): GeoBounds => {
  const latDelta = radiusKm / 111; // Approximate degrees per km for latitude
  const lonDelta = radiusKm / (111 * Math.cos(deg2rad(center.latitude))); // Adjust for longitude

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lonDelta,
    west: center.longitude - lonDelta,
  };
};

/**
 * Check if a point is within a bounding box
 * @param point Point to check
 * @param bounds Bounding box
 * @returns True if point is within bounds
 */
export const isPointInBounds = (point: GeoPoint, bounds: GeoBounds): boolean => {
  return (
    point.latitude >= bounds.south &&
    point.latitude <= bounds.north &&
    point.longitude >= bounds.west &&
    point.longitude <= bounds.east
  );
};

/**
 * Normalize location text for consistency
 * @param location Location string
 * @returns Normalized location string
 */
export const normalizeLocation = (location: string): string => {
  return location
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(
      /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place)\b/g,
      match => {
        const abbreviations: Record<string, string> = {
          st: 'street',
          street: 'street',
          ave: 'avenue',
          avenue: 'avenue',
          rd: 'road',
          road: 'road',
          blvd: 'boulevard',
          boulevard: 'boulevard',
          dr: 'drive',
          drive: 'drive',
          ln: 'lane',
          lane: 'lane',
          ct: 'court',
          court: 'court',
          pl: 'place',
          place: 'place',
        };
        return abbreviations[match.toLowerCase()] || match;
      }
    );
};

/**
 * Extract city and district from location text
 * @param location Location string
 * @returns Object with city and district
 */
export const extractLocationParts = (location: string): { city: string; district: string } => {
  const normalized = normalizeLocation(location);
  const parts = normalized.split(',').map(part => part.trim());

  if (parts.length >= 2) {
    return {
      city: parts[0]!,
      district: parts[1]!,
    };
  }

  // If no comma, try to split by common separators
  const separators = [' - ', ' | ', ' / '];
  for (const separator of separators) {
    if (normalized.includes(separator)) {
      const splitParts = normalized.split(separator).map(part => part.trim());
      if (splitParts.length >= 2) {
        return {
          city: splitParts[0]!,
          district: splitParts[1]!,
        };
      }
    }
  }

  // Default to using the whole string as city
  return {
    city: normalized,
    district: normalized,
  };
};

/**
 * Get approximate coordinates for a city (simplified implementation)
 * In production, you'd use a geocoding service like Google Maps API
 */
export const getCityCoordinates = (city: string): GeoPoint | null => {
  // This is a simplified mapping - in production use a proper geocoding service
  const cityCoordinates: Record<string, GeoPoint> = {
    mumbai: { latitude: 19.076, longitude: 72.8777 },
    delhi: { latitude: 28.7041, longitude: 77.1025 },
    bangalore: { latitude: 12.9716, longitude: 77.5946 },
    hyderabad: { latitude: 17.385, longitude: 78.4867 },
    chennai: { latitude: 13.0827, longitude: 80.2707 },
    kolkata: { latitude: 22.5726, longitude: 88.3639 },
    pune: { latitude: 18.5204, longitude: 73.8567 },
    ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
    jaipur: { latitude: 26.9124, longitude: 75.7873 },
    surat: { latitude: 21.1702, longitude: 72.8311 },
  };

  const normalizedCity = city.toLowerCase().trim();
  return cityCoordinates[normalizedCity] || null;
};
