import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local .env before importing.');
  process.exit(1);
}

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
const database = readJson('data/db.json');
const curriculum = readJson('data/r2023-curriculum.json');
const initialPasswords = [
  { email: 'admin@ciet.ac.in', defaultPassword: 'Admin@123', envName: 'INITIAL_ADMIN_PASSWORD' },
  { email: 'hod.mech@ciet.ac.in', defaultPassword: 'Staff@123', envName: 'INITIAL_STAFF_PASSWORD' },
  { email: 'sangeetha.mech@ciet.ac.in', defaultPassword: 'Staff@123', envName: 'INITIAL_STAFF_PASSWORD' },
  { email: 'arjun@ciet.ac.in', defaultPassword: 'Student@123', envName: 'INITIAL_STUDENT_PASSWORD' },
  { email: 'nivedha@ciet.ac.in', defaultPassword: 'Student@123', envName: 'INITIAL_STUDENT_PASSWORD' },
];
for (const { email, defaultPassword, envName } of initialPasswords) {
  const user = database.users?.find((item) => item.email.toLowerCase() === email);
  if (!user || !bcrypt.compareSync(defaultPassword, user.passwordHash)) continue;
  const replacement = process.env[envName];
  if (!replacement || replacement.length < 12) {
    console.error(`A seeded account still uses its known default password. Set ${envName} (at least 12 characters) in local .env before importing.`);
    process.exit(1);
  }
  user.passwordHash = bcrypt.hashSync(replacement, 10);
}
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

const { data: existing, error: readError } = await supabase
  .from('portal_state')
  .select('payload')
  .eq('id', 1)
  .single();

if (readError) {
  console.error(`Could not read portal_state: ${readError.message}`);
  process.exit(1);
}

if (existing.payload) {
  console.error('Supabase already contains portal data. Import stopped without changing it.');
  process.exit(1);
}

const { error: updateError } = await supabase
  .from('portal_state')
  .update({
    payload: { database, curriculum },
    updated_at: new Date().toISOString(),
  })
  .eq('id', 1);

if (updateError) {
  console.error(`Could not import portal data: ${updateError.message}`);
  process.exit(1);
}

console.log(`Imported ${database.users?.length || 0} users and ${curriculum.courses?.length || 0} curriculum courses into Supabase.`);