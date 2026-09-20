#!/usr/bin/env node

/**
 * Import cases from Missing Voices Kenya (missingvoices.or.ke)
 * Checks for duplicates before inserting to avoid data duplication
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// County mapping for location normalization
const COUNTY_ALIASES = {
  'nairobi': 'nairobi',
  'mombasa': 'mombasa',
  'kisumu': 'kisumu',
  'nakuru': 'nakuru',
  'eldoret': 'uasin gishu',
  'thika': 'kiambu',
  'machakos': 'machakos',
  'meru': 'meru',
  'nyeri': 'nyeri',
  'garissa': 'garissa',
  'kakamega': 'kakamega',
  'kisii': 'kisii',
  'bungoma': 'bungoma',
  'busia': 'busia',
  'kitui': 'kitui',
  'embu': 'embu',
  'kericho': 'kericho',
  'bomet': 'bomet',
  'kajiado': 'kajiado',
  'kiambu': 'kiambu',
  'kilifi': 'kilifi',
  'kirinyaga': 'kirinyaga',
  'kwale': 'kwale',
  'laikipia': 'laikipia',
  'lamu': 'lamu',
  'makueni': 'makueni',
  'mandera': 'mandera',
  'marsabit': 'marsabit',
  'migori': 'migori',
  'murang\'a': 'muranga',
  'nyandarua': 'nyandarua',
  'nyamira': 'nyamira',
  'samburu': 'samburu',
  'siaya': 'siaya',
  'taita taveta': 'taita taveta',
  'tana river': 'tana river',
  'tharaka nithi': 'tharaka-nithi',
  'trans nzoia': 'trans-nzoia',
  'turkana': 'turkana',
  'uasin gishu': 'uasin gishu',
  'vihiga': 'vihiga',
  'wajir': 'wajir',
  'west pokot': 'west pokot',
  'homa bay': 'homa bay',
  'isiolo': 'isiolo',
  'nandi': 'nandi',
  'narok': 'narok',
};

/**
 * Normalize a county name to our standard format
 */
function normalizeCounty(location) {
  if (!location) return null;
  
  const lower = location.toLowerCase().trim();
  
  // Direct match
  if (COUNTY_ALIASES[lower]) {
    return COUNTY_ALIASES[lower];
  }
  
  // Partial match
  for (const [alias, county] of Object.entries(COUNTY_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return county;
    }
  }
  
  return lower;
}

/**
 * Normalize a victim name for comparison
 */
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Create a deduplication key for a case
 */
function createDedupeKey(caseData) {
  const name = normalizeName(caseData.victimName);
  const county = normalizeCounty(caseData.county);
  const date = caseData.incidentDate;
  
  // For named cases: name + date + county
  if (name && name !== 'unknown' && name !== '') {
    return `named:${name}|${date}|${county}`;
  }
  
  // For unknown cases: date + county + description snippet
  const descSnippet = (caseData.description || '').substring(0, 50).toLowerCase();
  return `unknown:${date}|${county}|${descSnippet}`;
}

/**
 * Fetch all existing cases from our database
 */
async function fetchExistingCases() {
  console.log('📊 Fetching existing cases from database...');
  
  const { data, error } = await supabase
    .from('cases')
    .select('id, victim_name, incident_date, county, description');
  
  if (error) {
    console.error('❌ Error fetching existing cases:', error);
    process.exit(1);
  }
  
  console.log(`✅ Found ${data.length} existing cases`);
  
  // Build deduplication set
  const existingKeys = new Set();
  data.forEach(existingCase => {
    const key = createDedupeKey({
      victimName: existingCase.victim_name,
      incidentDate: existingCase.incident_date,
      county: existingCase.county,
      description: existingCase.description
    });
    existingKeys.add(key);
  });
  
  return existingKeys;
}

/**
 * Parse a Missing Voices page and extract cases
 */
async function parseMissingVoicesPage(url) {
  console.log(`🔍 Scraping: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ Failed to fetch ${url}: ${response.status}`);
    return [];
  }
  
  const html = await response.text();
  const cases = [];
  
  // Extract case data from the statistics table
  // Looking for table rows with: name, age, sex, location, date, description
  const tableRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let match;
  
  while ((match = tableRegex.exec(html)) !== null) {
    const row = match[1];
    
    // Extract cells
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells = [];
    let cellMatch;
    
    while ((cellMatch = cellRegex.exec(row)) !== null) {
      // Strip HTML tags and decode entities
      let content = cellMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      cells.push(content);
    }
    
    // Expected format: [No, Name, Age, Sex, Location, Manner of Death, Date of Incident, Profile Image]
    if (cells.length >= 7) {
      const victimName = cells[1] || 'Unknown';
      const age = cells[2] ? parseInt(cells[2]) : null;
      const sex = cells[3] || null;
      const location = cells[4] || null;
      const description = cells[5] || 'No description available';
      const dateStr = cells[6];

      // Parse date (format: "15 August, 2026" or "15 Aug 2026")
      let incidentDate = null;
      if (dateStr) {
        const dateMatch = dateStr.match(/(\d{1,2})\s+(\w+),?\s+(\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const monthMap = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
            'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
            'january': '01', 'february': '02', 'march': '03', 'april': '04',
            'june': '06', 'july': '07', 'august': '08',
            'september': '09', 'october': '10', 'november': '11', 'december': '12'
          };
          const monthNum = monthMap[month.toLowerCase().substring(0, 3)];
          if (monthNum) {
            incidentDate = `${year}-${monthNum}-${day.padStart(2, '0')}`;
          }
        }
      }
      
      const county = normalizeCounty(location) || 'Unknown';

      // Detect case type based on description
      const descriptionLower = description.toLowerCase();
      let caseType = 'death'; // Default
      
      if (descriptionLower.includes('missing') || 
          descriptionLower.includes('disappear') || 
          descriptionLower.includes('abducted') ||
          descriptionLower.includes('abduction')) {
        caseType = 'enforced_disappearance';
      }

      cases.push({
        victimName,
        age,
        sex,
        county,
        location: location,
        incidentDate,
        description,
        source: 'Missing Voices Kenya',
        caseType
      });
    }
  }
  
  console.log(`   Found ${cases.length} cases on this page`);
  return cases;
}

/**
 * Scrape all pages from Missing Voices (no year filtering needed)
 */
async function scrapeAllPages() {
  console.log('\n📡 Starting web scraping...');
  const allCases = [];
  
  let page = 0;
  let hasMore = true;
  
  while (hasMore) {
    const url = page === 0 
      ? `https://missingvoices.or.ke/statistics` 
      : `https://missingvoices.or.ke/statistics?page=${page}`;
    
    const cases = await parseMissingVoicesPage(url);
    
    if (cases.length === 0) {
      hasMore = false;
    } else {
      allCases.push(...cases);
      page++;
      
      console.log(`   Total scraped so far: ${allCases.length}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return allCases;
}

/**
 * Insert new cases into the database
 */
async function insertNewCases(cases, existingKeys) {
  console.log('\n💾 Processing cases for insertion...');
  
  const newCases = [];
  let duplicateCount = 0;
  let nullDateCount = 0;
  
  for (const caseData of cases) {
    const key = createDedupeKey(caseData);

    if (existingKeys.has(key)) {
      duplicateCount++;
      continue;
    }

    // Mark as processed to avoid inserting twice in the same run
    existingKeys.add(key);

    newCases.push({
      victim_name: caseData.victimName,
      age: caseData.age,
      sex: caseData.sex,
      county: caseData.county,
      location: caseData.location || caseData.county,
      incident_date: caseData.incidentDate,
      description: caseData.description,
      source: caseData.source,
      case_type: caseData.caseType,
      status: 'unconfirmed',
      latitude: 0, // Will need to be updated later
      longitude: 0,
      needs_verification: true,
      community_verified: false,
      confirmation_count: 0,
      created_at: new Date().toISOString()
    });
  }

  console.log(`✅ ${newCases.length} new cases to insert`);
  console.log(`⏭️  ${duplicateCount} duplicates skipped`);
  
  if (newCases.length === 0) {
    console.log('ℹ️  No new cases to insert');
    return 0;
  }
  
  // Batch insert in chunks of 100
  const batchSize = 100;
  let insertedCount = 0;
  
  for (let i = 0; i < newCases.length; i += batchSize) {
    const batch = newCases.slice(i, i + batchSize);
    
    console.log(`   Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newCases.length / batchSize)}...`);
    
    const { data, error } = await supabase
      .from('cases')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting batch:`, error);
      continue;
    }
    
    insertedCount += data.length;
  }
  
  console.log(`\n✅ Successfully inserted ${insertedCount} new cases`);
  return insertedCount;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Missing Voices Kenya Import Script\n');
  
  // Step 1: Fetch existing cases
  const existingKeys = await fetchExistingCases();
  
  // Step 2: Scrape all pages
  const scrapedCases = await scrapeAllPages();
  
  console.log(`\n📊 Scraped ${scrapedCases.length} total cases from Missing Voices`);
  
  // Step 3: Insert new cases
  const insertedCount = await insertNewCases(scrapedCases, existingKeys);
  
  console.log('\n🎉 Import complete!');
  console.log(`   Total cases in database: ${existingKeys.size + insertedCount}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
