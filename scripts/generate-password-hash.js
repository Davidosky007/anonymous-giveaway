#!/usr/bin/env node

import bcrypt from 'bcrypt';

async function generatePasswordHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('Usage: node scripts/generate-password-hash.js <password>');
    console.log('Example: node scripts/generate-password-hash.js mySecurePassword123');
    process.exit(1);
  }
  
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hash generated:');
    console.log(hash);
    console.log('\nAdd this to your .env.local file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();
