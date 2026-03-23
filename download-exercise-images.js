// Downloads exercise images from wger.de public API (no auth required)
// Run: node download-exercise-images.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://wger.de';
const OUT_DIR = path.join(__dirname, 'assets', 'gifs');

// Maps our exercise IDs → best wger search terms
const EXERCISES = [
  { id: 'incline_barbell_press',     query: 'Incline Bench Press Barbell' },
  { id: 'flat_bench_press',          query: 'Bench Press' },
  { id: 'seated_db_overhead_press',  query: 'Shoulder Press Dumbbells' },
  { id: 'cable_lateral_raise',       query: 'Cable Lateral Raise' },
  { id: 'tricep_bar_pushdown',       query: 'Triceps Pushdown' },
  { id: 'overhead_tricep_extension', query: 'Overhead Triceps Extension' },
  { id: 'cable_face_pull',           query: 'Face Pull' },
  { id: 'cable_face_pull_pull_a',    query: 'Face Pull' },
  { id: 'cable_face_pull_push_b',    query: 'Face Pull' },
  { id: 'weighted_pullup',           query: 'Pull-up' },
  { id: 'weighted_pullup_b',         query: 'Pull-up' },
  { id: 'barbell_bent_over_row',     query: 'Bent Over Row Barbell' },
  { id: 'seated_cable_row_neutral',  query: 'Seated Cable Row' },
  { id: 'seated_cable_row_wide',     query: 'Seated Cable Row' },
  { id: 'ez_bar_curl',              query: 'EZ Bar Curl' },
  { id: 'hammer_curl',              query: 'Hammer Curl' },
  { id: 'barbell_back_squat',        query: 'Barbell Squat' },
  { id: 'barbell_hip_thrust',        query: 'Hip Thrust' },
  { id: 'db_hip_thrust',             query: 'Hip Thrust' },
  { id: 'leg_press',                 query: 'Leg Press' },
  { id: 'lying_leg_curl',            query: 'Lying Leg Curl' },
  { id: 'standing_calf_raise',       query: 'Standing Calf Raise' },
  { id: 'seated_calf_raise',         query: 'Seated Calf Raise' },
  { id: 'cable_crunch',              query: 'Cable Crunch' },
  { id: 'ab_wheel_rollout',          query: 'Ab Wheel' },
  { id: 'incline_db_press',          query: 'Incline Dumbbell Press' },
  { id: 'cable_chest_fly',           query: 'Cable Fly Chest' },
  { id: 'arnold_press',              query: 'Arnold Press' },
  { id: 'cable_lateral_raise_leaning', query: 'Cable Lateral Raise' },
  { id: 'weighted_dips_chest',       query: 'Dips' },
  { id: 'skull_crusher',             query: 'Skull Crusher' },
  { id: 'chest_supported_db_row',    query: 'Chest Supported Row' },
  { id: 'cable_rear_delt_fly',       query: 'Rear Delt Fly' },
  { id: 'incline_db_curl',           query: 'Incline Curl' },
  { id: 'cable_curl_single_arm',     query: 'Cable Bicep Curl' },
  { id: 'bulgarian_split_squat',     query: 'Bulgarian Split Squat' },
  { id: 'hack_squat',                query: 'Hack Squat' },
  { id: 'back_extension',            query: 'Back Extension' },
  { id: 'leg_extension',             query: 'Leg Extension' },
];

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'TimFit-PWA/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchExercise(query) {
  const url = `${BASE_URL}/api/v2/exercise/search/?term=${encodeURIComponent(query)}&language=english&format=json`;
  const { body } = await get(url);
  const data = JSON.parse(body.toString());
  // Find first result with an image
  const hit = (data.suggestions || []).find(s => s.data && s.data.image);
  return hit ? hit.data.image : null;
}

async function downloadImage(imageUrl, destPath) {
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : BASE_URL + imageUrl;
  const { status, body } = await get(fullUrl);
  if (status === 200) {
    fs.writeFileSync(destPath, body);
    return true;
  }
  return false;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const downloaded = new Map(); // query → local path (for deduplication)
  let ok = 0, skipped = 0, failed = 0;

  for (const ex of EXERCISES) {
    const destPath = path.join(OUT_DIR, ex.id + '.png');

    if (fs.existsSync(destPath)) {
      console.log(`  skip  ${ex.id} (already exists)`);
      skipped++;
      continue;
    }

    // Reuse already-downloaded query result
    if (downloaded.has(ex.query)) {
      fs.copyFileSync(downloaded.get(ex.query), destPath);
      console.log(`  copy  ${ex.id} (from cached query)`);
      ok++;
      continue;
    }

    process.stdout.write(`  fetch ${ex.id} (query: "${ex.query}") ... `);
    try {
      await sleep(300); // be polite to the server
      const imgPath = await searchExercise(ex.query);
      if (!imgPath) {
        console.log('no image found');
        failed++;
        continue;
      }
      const success = await downloadImage(imgPath, destPath);
      if (success) {
        downloaded.set(ex.query, destPath);
        console.log('ok');
        ok++;
      } else {
        console.log('download failed');
        failed++;
      }
    } catch (e) {
      console.log('error: ' + e.message);
      failed++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed`);
  console.log('\nIMPORTANT: Update program.js gif paths from .gif to .png');
  console.log('Run: node update-gif-paths.js');
}

main();
