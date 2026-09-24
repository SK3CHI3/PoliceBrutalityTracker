import { supabase, DatabaseCase, DatabaseCasePhoto, DatabaseCaseVideo, DatabaseCaseSubmission } from './supabase'
import { Case, SubmitCaseData } from '@/types'
import { getCountyCentroid } from './countyCentroids'

// Transform database case to frontend case format
export function transformDatabaseCase(
  dbCase: DatabaseCase,
  photos: DatabaseCasePhoto[] = [],
  videos: DatabaseCaseVideo[] = []
): Case {
  return {
    id: dbCase.id,
    victimName: dbCase.victim_name || 'Unknown',
    age: dbCase.age,
    date: dbCase.incident_date,
    time: dbCase.incident_time,
    location: dbCase.location || '',
    county: dbCase.county || '',
    coordinates: [dbCase.latitude, dbCase.longitude],
    type: dbCase.case_type || 'other',
    description: dbCase.description || '',
    status: dbCase.status || 'unconfirmed',
    photos: photos.map(p => p.photo_url),
    videoLinks: videos.map(v => v.video_url),
    source: dbCase.source || '',
    reportedBy: dbCase.reported_by,
    justiceServed: dbCase.justice_served,
    officersInvolved: dbCase.officer_names?.map(name => ({ name })) || [],
    witnesses: dbCase.witnesses || [],
    // Community verification fields
    confirmation_count: dbCase.confirmation_count || 0,
    community_verified: dbCase.community_verified || false,
    needs_verification: dbCase.needs_verification ?? true,
    admin_approved_at: dbCase.admin_approved_at,
  }
}

// Fetch all cases with their photos and videos
export async function fetchCases(): Promise<Case[]> {
  try {
    // Fetch all cases using pagination to bypass Supabase's max rows limit
    const allCases: DatabaseCase[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const to = from + batchSize - 1;
      const { data: casesBatch, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('incident_date', { ascending: false })
        .range(from, to);

      if (casesError) {
        console.error('Error fetching cases:', casesError);
        throw casesError;
      }

      if (casesBatch && casesBatch.length > 0) {
        allCases.push(...casesBatch);
        from += batchSize;
        // If we got fewer than batchSize, we've reached the end
        if (casesBatch.length < batchSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    if (!allCases || allCases.length === 0) {
      return [];
    }

    // Fetch photos for all cases
    const { data: photos, error: photosError } = await supabase
      .from('case_photos')
      .select('*')

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    // Fetch videos for all cases
    const { data: videos, error: videosError } = await supabase
      .from('case_videos')
      .select('*')

    if (videosError) {
      console.error('Error fetching videos:', videosError)
    }

    // Transform and combine data
    return allCases.map(dbCase => {
      const casePhotos = photos?.filter(p => p.case_id === dbCase.id) || []
      const caseVideos = videos?.filter(v => v.case_id === dbCase.id) || []
      return transformDatabaseCase(dbCase, casePhotos, caseVideos)
    })

  } catch (error) {
    console.error('Error in fetchCases:', error)
    throw error
  }
}

// Fetch a single case by ID
export async function fetchCaseById(id: string): Promise<Case | null> {
  try {
    const { data: dbCase, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw caseError
    }

    if (!dbCase) {
      return null
    }

    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from('case_photos')
      .select('*')
      .eq('case_id', id)

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    // Fetch videos
    const { data: videos, error: videosError } = await supabase
      .from('case_videos')
      .select('*')
      .eq('case_id', id)

    if (videosError) {
      console.error('Error fetching videos:', videosError)
    }

    return transformDatabaseCase(dbCase, photos || [], videos || [])

  } catch (error) {
    console.error('Error in fetchCaseById:', error)
    throw error
  }
}

// Submit a new case
export async function submitCase(caseData: SubmitCaseData): Promise<string> {
  try {
    // Upload photos to Supabase Storage if any
    const photoUrls: string[] = []
    if (caseData.photos && caseData.photos.length > 0) {
      for (const photo of caseData.photos) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `case-submissions/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('case-photos')
          .upload(filePath, photo, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading photo:', uploadError)
          // Continue with other photos even if one fails
          continue
        }

        // Get public URL for the uploaded photo
        const { data: { publicUrl } } = supabase.storage
          .from('case-photos')
          .getPublicUrl(filePath)

        photoUrls.push(publicUrl)
      }
    }

    const { data, error } = await supabase
      .from('case_submissions')
      .insert({
        victim_name: caseData.victimName,
        age: caseData.age,
        incident_date: caseData.date,
        incident_time: caseData.time,
        location: caseData.location,
        county: caseData.county,
        latitude: caseData.latitude,
        longitude: caseData.longitude,
        case_type: caseData.type,
        description: caseData.description,
        justice_served: caseData.justiceServed,
        officer_names: caseData.officerNames || [],
        witnesses: caseData.witnesses || [],
        photo_urls: photoUrls,
        video_urls: caseData.videoLinks || [],
        reporter_name: null, // Always null since we don't collect names
        reporter_contact: caseData.reporterContact || null,
        is_anonymous: true, // Always true since we don't collect names
        wants_updates: caseData.wantsUpdates || false,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error submitting case:', error)
      throw error
    }

    return data.id
  } catch (error) {
    console.error('Error in submitCase:', error)
    throw error
  }
}

// Fetch pending case submissions
export async function fetchPendingSubmissions(): Promise<DatabaseCaseSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('case_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending submissions:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchPendingSubmissions:', error)
    throw error
  }
}

// Approve a case submission (uses transactional RPC function)
export async function approveSubmission(submissionId: string, caseTypeOverride?: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('approve_submission', {
      p_submission_id: submissionId,
      p_case_type_override: caseTypeOverride || null
    })

    if (error) {
      console.error('Error approving submission:', error)
      throw error
    }

    // RPC returns JSON with success field
    const result = data as any
    if (!result.success) {
      throw new Error(result.error || 'Failed to approve submission')
    }
  } catch (error) {
    console.error('Error in approveSubmission:', error)
    throw error
  }
}

// Reject a case submission (uses RPC function)
export async function rejectSubmission(submissionId: string, reason?: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('reject_submission', {
      p_submission_id: submissionId,
      p_reason: reason || null
    })

    if (error) {
      console.error('Error rejecting submission:', error)
      throw error
    }

    const result = data as any
    if (!result.success) {
      throw new Error(result.error || 'Failed to reject submission')
    }
  } catch (error) {
    console.error('Error in rejectSubmission:', error)
    throw error
  }
}

// Fetch counties
export async function fetchCounties(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('counties')
      .select('name')
      .order('name')

    if (error) {
      console.error('Error fetching counties:', error)
      throw error
    }

    return data?.map(county => county.name) || []
  } catch (error) {
    console.error('Error in fetchCounties:', error)
    throw error
  }
}

