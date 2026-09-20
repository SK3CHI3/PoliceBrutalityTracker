import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface DatabaseCase {
  id: string
  victim_name: string
  age?: number
  incident_date: string
  incident_time?: string
  location: string
  county: string
  latitude: number
  longitude: number
  case_type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'abduction' | 'enforced_disappearance' | 'other'
  description: string
  status: 'confirmed' | 'unconfirmed'
  source?: string
  reported_by?: string
  justice_served: boolean
  officer_names?: string[]
  witnesses?: string[]
  created_at: string
  updated_at: string
  // Community verification fields
  confirmation_count?: number
  community_verified?: boolean
  needs_verification?: boolean
  admin_approved_at?: string
}

export interface DatabaseCasePhoto {
  id: string
  case_id: string
  photo_url: string
  caption?: string
  uploaded_at: string
}

export interface DatabaseCaseVideo {
  id: string
  case_id: string
  video_url: string
  platform?: string
  title?: string
  uploaded_at: string
}

export interface DatabaseCaseSubmission {
  id: string
  victim_name?: string | null
  age?: number
  incident_date?: string | null
  incident_time?: string
  location?: string | null
  county?: string | null
  latitude?: number
  longitude?: number
  case_type?: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'abduction' | 'enforced_disappearance' | 'other' | null
  description: string
  // Scraper-only fields (populated by the n8n weekly scraper)
  title?: string | null
  severity?: string | null
  source_url?: string | null
  justice_served?: boolean
  officer_names?: string[]
  witnesses?: string[]
  photo_urls?: string[]
  video_urls?: string[]
  reporter_name?: string | null
  reporter_contact?: string | null
  is_anonymous?: boolean
  wants_updates?: boolean
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  review_notes?: string
  created_at: string
  reviewed_at?: string
}
