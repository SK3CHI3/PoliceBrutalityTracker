/**
 * Dynamic Sitemap Generator for PoliceBrutalityTracker
 * 
 * This script generates a sitemap.xml file that includes all case URLs
 * Run this script before deployment or as part of the build process
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Warning: Supabase credentials not found. Generating sitemap with static pages only.');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const BASE_URL = 'https://policebrutalitytracker.co.ke';

// Static pages configuration
const staticPages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/map', changefreq: 'daily', priority: '0.9' },
  { path: '/cases', changefreq: 'daily', priority: '0.8' },
  { path: '/cases-index', changefreq: 'daily', priority: '0.9' },
  { path: '/news', changefreq: 'daily', priority: '0.9' },
];

/**
 * Fetch all approved case IDs from Supabase
 */
async function fetchCases() {
  if (!supabase) {
    console.log('ℹ️  Skipping case fetch - no Supabase connection');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, updated_at')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching cases:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} cases from database`);
    return data;
  } catch (err) {
    console.error('❌ Error:', err);
    return [];
  }
}

/**
 * Fetch all published news articles from Supabase
 */
async function fetchNewsArticles() {
  if (!supabase) {
    console.log('ℹ️  Skipping news fetch - no Supabase connection');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching news articles:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} published news articles from database`);
    return data;
  } catch (err) {
    console.error('❌ Error fetching news:', err);
    return [];
  }
}

/**
 * Generate sitemap XML content
 */
function generateSitemapXML(cases, newsArticles) {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add dynamic case pages
  cases.forEach(caseItem => {
    const lastmod = caseItem.updated_at
      ? new Date(caseItem.updated_at).toISOString().split('T')[0]
      : currentDate;

    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/case/${caseItem.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  // Add news articles with news sitemap extension
  newsArticles.forEach(article => {
    const lastmod = article.updated_at
      ? new Date(article.updated_at).toISOString().split('T')[0]
      : currentDate;

    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/news/${article.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>PoliceBrutalityTracker</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${lastmod}</news:publication_date>\n`;
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting sitemap generation...');
  console.log(`📍 Base URL: ${BASE_URL}`);

  // Fetch cases and news articles
  const cases = await fetchCases();
  const newsArticles = await fetchNewsArticles();

  // Generate XML
  const sitemapXML = generateSitemapXML(cases, newsArticles);

  // Write to file
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  try {
    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`📊 Total URLs: ${staticPages.length + cases.length + newsArticles.length}`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Case pages: ${cases.length}`);
    console.log(`   - News articles: ${newsArticles.length}`);
  } catch (err) {
    console.error('❌ Error writing sitemap file:', err);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

