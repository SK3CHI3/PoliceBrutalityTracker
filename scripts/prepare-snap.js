import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Skip prerendering if SKIP_PRERENDER env var is set
if (process.env.SKIP_PRERENDER === 'true') {
  console.log('⏭️  Skipping prerendering (SKIP_PRERENDER=true)');
  process.exit(0);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Fetching all cases for react-snap...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found. Using static pages only.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSnapConfig() {
  try {
    // Fetch all published cases
    const { data: cases, error } = await supabase
      .from('cases')
      .select('id')
      .order('incident_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching cases:', error.message);
      process.exit(0);
    }

    // Generate URLs for all case pages
    const caseUrls = cases.map(c => `/cases/${c.id}`);
    
    // Static pages
    const staticPages = [
      '/',
      '/map',
      '/cases',
      '/cases-index'
    ];

    const allPages = [...staticPages, ...caseUrls];

    console.log(`✅ Found ${cases.length} cases`);
    console.log(`📄 Total pages to prerender: ${allPages.length}`);

    // Read package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Update reactSnap include array
    packageJson.reactSnap.include = allPages;

    // Write back to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log('✅ Updated package.json with all case URLs');
    console.log('🚀 react-snap will now prerender all case pages!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(0); // Don't fail the build, just skip
  }
}

generateSnapConfig();

