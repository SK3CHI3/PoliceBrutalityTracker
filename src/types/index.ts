export interface Officer {
  name: string;
  badge_number?: string;
  rank?: string;
  station?: string;
  photo_url?: string;
}

export interface Case {
  id: string;
  victimName: string;
  age?: number;
  date: string;
  location: string;
  county: string;
  coordinates: [number, number];
  type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'abduction' | 'enforced_disappearance' | 'other';
  description: string;
  status: 'confirmed' | 'unconfirmed';
  photos?: string[];
  videoLinks?: string[];
  source: string;
  reportedBy?: string;
  justiceServed?: boolean;
  // Additional detailed information
  time?: string;
  policeStation?: string;
  officersInvolved?: Officer[];
  witnesses?: string[];
  caseNumber?: string;
  familyContact?: string;
  medicalReport?: string;
  legalStatus?: string;
  compensation?: string;
  created_at?: string;
  updated_at?: string;
  scraped_from_url?: string;
  confidence_score?: number;
  auto_approved?: boolean;
  // Community verification fields
  confirmation_count?: number;
  community_verified?: boolean;
  needs_verification?: boolean;
  admin_approved_at?: string;
}

export interface CaseConfirmation {
  id: string;
  case_id: string;
  user_ip: string;
  user_fingerprint?: string;
  user_agent?: string;
  confirmed_at: string;
  created_at: string;
}

export interface ConfirmCaseResponse {
  success: boolean;
  message: string;
  confirmation: {
    id: string;
    confirmed_at: string;
  };
  case: {
    id: string;
    confirmation_count: number;
    community_verified: boolean;
    needs_verification: boolean;
  };
}

export interface FilterState {
  search?: string;
  counties: string[];
  caseTypes: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SubmitCaseData {
  victimName: string;
  age?: number;
  date: string;
  time?: string;
  location: string;
  county: string;
  latitude: number;
  longitude: number;
  type: Case['type'];
  description: string;
  justiceServed?: boolean;
  officerNames?: string[];
  witnesses?: string[];
  photos?: File[];
  videoLinks?: string[];
  reporterContact?: string;
  isAnonymous?: boolean;
  wantsUpdates?: boolean;
  // Temporary fields for form state
  newOfficerName?: string;
  newWitnessName?: string;
}
