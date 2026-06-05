import axios from 'axios';
import { POPULAR_CITIES } from '../../config/constants';
import { env } from '../../config/env';

type ReverseGeocodeAddress = Record<string, string | undefined>;
type ReverseGeocodeResponse = {
  display_name?: string;
  address?: ReverseGeocodeAddress;
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Kota': { lat: 25.2138, lng: 75.8648 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
};

const CITY_ALIASES: Record<string, string> = {
  'bhopal': 'Bhopal',
  'indore': 'Indore',
  'patna': 'Patna',
  'kota': 'Kota',
  'jaipur': 'Jaipur',
  'lucknow': 'Lucknow',
  'varanasi': 'Varanasi',
  'banaras': 'Varanasi',
  'noida': 'Noida',
  'new delhi': 'Delhi NCR',
  'delhi': 'Delhi NCR',
  'south delhi': 'Delhi NCR',
  'north delhi': 'Delhi NCR',
  'west delhi': 'Delhi NCR',
  'east delhi': 'Delhi NCR',
  'central delhi': 'Delhi NCR',
  'gurugram': 'Gurgaon',
  'gurgaon': 'Gurgaon',
  'chandigarh': 'Chandigarh',
  'dehradun': 'Dehradun',
  'ranchi': 'Ranchi',
  'nagpur': 'Nagpur',
  'pune': 'Pune',
  'bengaluru': 'Bangalore',
  'bangalore': 'Bangalore',
  'hyderabad': 'Hyderabad',
  'chennai': 'Chennai',
  'kolkata': 'Kolkata',
  'calcutta': 'Kolkata',
  'mumbai': 'Mumbai',
  'bombay': 'Mumbai',
  'ahmedabad': 'Ahmedabad',
};

const CITY_AREAS: Record<string, string[]> = {
  'Bhopal': ['MP Nagar', 'Arera Colony', 'New Market', 'Kolar Road', 'Hoshangabad Road', 'Shahpura', 'Habibganj', 'Bairagarh', 'Ayodhya Nagar', 'Misrod', 'Ashoka Garden', 'Govindpura', 'Karond', 'Lalghati', 'BHEL', 'TT Nagar', 'Bag Sewaniya', 'Ratibad', 'Mandideep', 'Raisen Road'],
  'Indore': ['Vijay Nagar', 'Palasia', 'Sapna Sangeeta', 'AB Road', 'Bhawarkuan', 'Rajwada', 'MR 10', 'Super Corridor', 'Nipania', 'Scheme 78', 'Scheme 54', 'Sudama Nagar', 'LIG', 'MIG', 'Rau', 'Dewas Naka', 'Bypass Road'],
  'Patna': ['Boring Road', 'Kankarbagh', 'Rajendra Nagar', 'Patna Junction', 'Bailey Road', 'Danapur', 'Ashiana Nagar', 'Saguna More', 'Anisabad', 'Gardanibagh'],
  'Kota': ['Talwandi', 'Vigyan Nagar', 'Mahaveer Nagar', 'Kunhari', 'Dadabari', 'Gumanpura', 'Rangbari', 'Rawatbhata Road', 'Jhalawar Road'],
  'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme', 'Raja Park', 'Tonk Road', 'Jagatpura', 'Sitapura', 'Sodala', 'Bani Park', 'MI Road', 'Ajmer Road'],
  'Lucknow': ['Hazratganj', 'Gomti Nagar', 'Aliganj', 'Indira Nagar', 'Rajajipuram', 'Mahanagar', 'Aminabad', 'Alambagh', 'Chinhat', 'Vikas Nagar'],
  'Delhi NCR': ['Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Connaught Place', 'Pitampura', 'Janakpuri', 'Vasant Kunj', 'Nehru Place', 'Mayur Vihar', 'Laxmi Nagar'],
  'Noida': ['Sector 62', 'Sector 63', 'Sector 18', 'Sector 15', 'Sector 76', 'Greater Noida', 'Sector 137', 'Sector 44', 'Sector 50'],
  'Bangalore': ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'BTM Layout', 'JP Nagar', 'Marathahalli', 'Electronic City', 'Jayanagar', 'Hebbal'],
  'Mumbai': ['Andheri', 'Bandra', 'Powai', 'Lower Parel', 'Malad', 'Goregaon', 'Thane', 'Navi Mumbai', 'Dadar', 'Churchgate'],
  'Pune': ['Kothrud', 'Hinjewadi', 'Viman Nagar', 'Wakad', 'Baner', 'Aundh', 'Hadapsar', 'Kharadi', 'Pimpri', 'Shivajinagar'],
  'Hyderabad': ['Madhapur', 'Gachibowli', 'Kondapur', 'Hitech City', 'Kukatpally', 'Ameerpet', 'Begumpet', 'Secunderabad', 'Jubilee Hills', 'Banjara Hills'],
  'Chennai': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'OMR', 'Guindy', 'Mylapore', 'Egmore', 'Nungambakkam'],
  'Kolkata': ['Salt Lake', 'New Town', 'Park Street', 'Howrah', 'Jadavpur', 'Gariahat', 'Dum Dum', 'Behala', 'Alipore'],
  'Ahmedabad': ['Satellite', 'SG Highway', 'Vastrapur', 'Navrangpura', 'Maninagar', 'Bopal', 'Prahlad Nagar', 'CG Road', 'Ashram Road'],
  'Gurgaon': ['Sector 29', 'DLF Phase 1-5', 'Sohna Road', 'MG Road', 'Golf Course Road', 'Sector 56', 'Sector 49', 'Udyog Vihar'],
  'Chandigarh': ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Panchkula', 'Mohali', 'Zirakpur'],
  'Varanasi': ['Lanka', 'Sigra', 'Godowlia', 'BHU', 'Assi Ghat', 'Sarnath', 'Pandeypur', 'Shivpur'],
  'Dehradun': ['Rajpur Road', 'Clock Tower', 'ISBT', 'Prem Nagar', 'Clement Town', 'Sahastradhara Road', 'GMS Road'],
  'Ranchi': ['Main Road', 'Lalpur', 'Doranda', 'Harmu', 'Bariatu', 'Kanke Road', 'Hinoo'],
  'Nagpur': ['Sitabuldi', 'Dharampeth', 'Sadar', 'Civil Lines', 'Manish Nagar', 'Wardha Road', 'Hingna'],
};

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNearestSupportedCity = (lat: number, lng: number) => {
  let nearestCity: string | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const distance = haversineDistanceKm(lat, lng, coords.lat, coords.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestCity = city;
    }
  }

  return { city: nearestCity, distanceKm: Number.isFinite(nearestDistance) ? Math.round(nearestDistance) : null };
};

const extractAddressCandidates = (address?: ReverseGeocodeAddress, displayName?: string) => {
  return [
    address?.city,
    address?.town,
    address?.state_district,
    address?.county,
    address?.municipality,
    address?.suburb,
    address?.neighbourhood,
    address?.quarter,
    address?.hamlet,
    address?.village,
    displayName,
  ].filter(Boolean) as string[];
};

const mapToSupportedCity = (address?: ReverseGeocodeAddress, displayName?: string) => {
  const candidates = extractAddressCandidates(address, displayName).map(normalizeText);

  for (const candidate of candidates) {
    for (const [alias, supportedCity] of Object.entries(CITY_ALIASES)) {
      if (candidate === alias || candidate.includes(alias)) {
        return supportedCity;
      }
    }
  }

  return null;
};

const formatCityName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getExactCityFromGeocode = (address?: ReverseGeocodeAddress, displayName?: string) => {
  const directCity = [
    address?.city,
    address?.town,
    address?.municipality,
    address?.county,
    address?.state_district,
    address?.village,
  ].find(Boolean);

  if (directCity) return formatCityName(directCity);

  if (!displayName) return null;
  const firstSegment = displayName.split(',')[0]?.trim();
  return firstSegment ? formatCityName(firstSegment) : null;
};

const resolveAreaForCity = (city: string, address?: ReverseGeocodeAddress, displayName?: string) => {
  const knownAreas = CITY_AREAS[city] || [];
  const combinedAddress = normalizeText([
    address?.suburb,
    address?.neighbourhood,
    address?.quarter,
    address?.residential,
    address?.road,
    address?.city_district,
    address?.state_district,
    displayName,
  ].filter(Boolean).join(' '));

  if (!combinedAddress) return null;

  return knownAreas.find((area) => {
    const normalizedArea = normalizeText(area);
    return combinedAddress.includes(normalizedArea) || normalizedArea.includes(combinedAddress);
  }) || null;
};

const reverseGeocodeLocationIq = async (lat: number, lng: number): Promise<ReverseGeocodeResponse | null> => {
  if (env.GEOCODING_PROVIDER === 'fallback' || !env.LOCATIONIQ_ACCESS_TOKEN) return null;

  try {
    const response = await axios.get<ReverseGeocodeResponse>(`${env.LOCATIONIQ_BASE_URL.replace(/\/$/, '')}/v1/reverse`, {
      params: {
        key: env.LOCATIONIQ_ACCESS_TOKEN,
        format: 'json',
        lat,
        lon: lng,
        addressdetails: 1,
        normalizeaddress: 1,
        'accept-language': 'en',
      },
      headers: {
        'User-Agent': env.LOCATIONIQ_USER_AGENT,
        'Accept': 'application/json',
      },
      timeout: 5000,
    });

    return response.data;
  } catch {
    return null;
  }
};

export const getAllCities = () => {
  return POPULAR_CITIES.map((city) => ({
    name: city,
    hasAreas: !!CITY_AREAS[city],
    areaCount: CITY_AREAS[city]?.length || 0,
  }));
};

export const getAreasForCity = (city: string) => {
  return CITY_AREAS[city] || [];
};

export const detectLocation = async (lat: number, lng: number) => {
  const geocodeResult = await reverseGeocodeLocationIq(lat, lng);
  const nearest = getNearestSupportedCity(lat, lng);
  const exactCity = getExactCityFromGeocode(geocodeResult?.address, geocodeResult?.display_name);
  const supportedCity = mapToSupportedCity(geocodeResult?.address, geocodeResult?.display_name) || nearest.city;
  const detectedCity = exactCity || supportedCity;
  const detectedArea = supportedCity
    ? resolveAreaForCity(supportedCity, geocodeResult?.address, geocodeResult?.display_name)
    : null;
  const hasExactUnsupportedCity = !!(exactCity && supportedCity && exactCity !== supportedCity);

  return {
    lat,
    lng,
    city: detectedCity,
    area: detectedArea,
    supportedCity,
    exactCity,
    nearbyAreas: supportedCity ? getAreasForCity(supportedCity).slice(0, 6) : [],
    accuracyKm: nearest.distanceKm,
    source: geocodeResult ? 'reverse_geocoding' : 'nearest_supported_city',
    displayName: geocodeResult?.display_name || null,
    message: detectedCity
      ? hasExactUnsupportedCity
        ? `Detected your exact location: ${detectedCity}. Nearest fully supported city is ${supportedCity}.`
        : `Detected location: ${detectedArea ? `${detectedArea}, ` : ''}${detectedCity}`
      : 'Could not detect your location',
  };
};

export const getAreaGuide = (city: string) => {
  const areas = CITY_AREAS[city];
  if (!areas) {
    return { city, areas: [], message: `No area guide available for ${city} yet` };
  }

  return {
    city,
    areas: areas.map((area) => ({
      name: area,
      propertyCount: 0,
      messCount: 0,
      avgRent: 0,
    })),
  };
};
