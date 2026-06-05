// ============================================
// ProjectX — Application Constants
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

export const OTP = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  COOLDOWN_SECONDS: 60,
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PROPERTY_PHOTOS: 10,
  MAX_MESS_PHOTOS: 15,
  MAX_ROOM_PHOTOS: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const PROPERTY_AMENITIES = [
  'WIFI', 'AC', 'BIKE_PARKING', 'CAR_PARKING', 'FOOD_MESS',
  'WASHING_MACHINE', 'GEYSER', 'TV', 'FRIDGE', 'ATTACHED_BATHROOM',
  'BALCONY', 'POWER_BACKUP', 'CCTV', 'SECURITY_GUARD', 'LIFT',
  'RO_WATER', 'LAUNDRY', 'GYM', 'STUDY_TABLE', 'BED',
] as const;

export const MESS_FEATURES = [
  'HOME_STYLE', 'AC_DINING', 'JAIN_FOOD', 'SWEET_INCLUDED',
  'UNLIMITED_FOOD', 'SUNDAY_SPECIAL', 'FESTIVAL_SPECIAL',
  'HYGIENE_CERTIFIED', 'FSSAI_LICENSED',
] as const;

export const CUISINE_TYPES = [
  'NORTH_INDIAN', 'SOUTH_INDIAN', 'CHINESE', 'CONTINENTAL',
  'RAJASTHANI', 'GUJARATI', 'BENGALI', 'MAHARASHTRIAN',
] as const;

export const POPULAR_CITIES = [
  'Bhopal', 'Indore', 'Patna', 'Kota', 'Jaipur',
  'Lucknow', 'Varanasi', 'Noida', 'Delhi NCR',
  'Chandigarh', 'Dehradun', 'Ranchi', 'Nagpur',
  'Pune', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Mumbai', 'Ahmedabad', 'Gurgaon',
] as const;

export const USER_INTERESTS = [
  'FIND_ROOM', 'LIST_PROPERTY', 'FIND_ROOMMATE', 'FIND_MESS', 'FIND_COOK',
] as const;

export const COMING_SOON_SERVICES = {
  HOME_SERVICES: {
    name: 'Home Services',
    description: 'Electrician, Plumber, AC Repair, Carpentry, Painting, Cleaning',
    icon: '🔧',
    color: '#FF6B35',
    subServices: [
      'Electrical', 'Plumbing', 'Appliance Repair', 'Carpentry', 'Painting', 'Cleaning',
    ],
  },
  VEHICLE_SERVICES: {
    name: 'Vehicle Services',
    description: 'Car Repair, Bike Repair, Emergency Roadside Assistance',
    icon: '🚗',
    color: '#4ECDC4',
    subServices: ['Car Repair', 'Bike Repair', 'Emergency Roadside'],
  },
  MEDICAL_SERVICES: {
    name: 'Medical Services',
    description: 'Doctor at Home, Mental Health Support',
    icon: '🏥',
    color: '#E74C3C',
    subServices: ['Doctor at Home', 'Mental Health'],
  },
  UTILITY_BOOKING: {
    name: 'Utility Booking',
    description: 'Gas Cylinder, Water Tanker Booking',
    icon: '⛽',
    color: '#3498DB',
    subServices: ['Gas Cylinder', 'Water Tanker'],
  },
  LABOUR_CHOWK: {
    name: 'Labour Chowk',
    description: 'Daily Wage Workers, Contractors, Skilled Labour',
    icon: '👷',
    color: '#F39C12',
    subServices: ['Contractor', 'Labour', 'Skilled Workers'],
  },
} as const;

export const ICE_BREAKER_QUESTIONS = [
  'Kab shift hona hai?',
  'Budget kitna hai?',
  'Kaunsa area?',
  'Study ya Job?',
  'Room dekha?',
  'Kitne log?',
] as const;

export const ROOMMATE_MATCH_WEIGHTS = {
  food: 15,
  smoking: 15,
  drinking: 10,
  sleep: 10,
  personality: 5,
  cleanliness: 10,
  budget: 15,
  location: 10,
  profession: 5,
  genderPref: 5,
} as const;

export const BEFORE_VISIT_CHECKLIST = [
  'Check the locality and neighbourhood',
  'Visit during day and night time',
  'Check water supply and pressure',
  'Test all electrical points',
  'Check mobile network coverage',
  'Inspect walls and ceiling for leaks',
  'Verify parking availability',
  'Ask about maintenance charges',
  'Check nearby markets and services',
  'Read the rental agreement carefully',
] as const;
