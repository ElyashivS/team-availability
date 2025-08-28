const axios = require('axios');

async function run() {
  const baseURL = process.env.SEED_API_URL || 'http://localhost:5000';
  try {
    const usersEnv = process.env.SEED_USERS;
    let users = [];
    if (usersEnv) {
      if (usersEnv.trim().startsWith('{') || usersEnv.trim().startsWith('[')) {
        users = JSON.parse(usersEnv);
      } else {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.isAbsolute(usersEnv) ? usersEnv : path.join(process.cwd(), usersEnv);
        users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    }

    if (Array.isArray(users) && users.length > 0) {
      await axios.post(`${baseURL}/api/users/mock`, { users });
    } else {
      await axios.post(`${baseURL}/api/users/mock`);
    }

    await axios.post(`${baseURL}/api/status/mock`);
    console.log('Seeding completed');
  } catch (e) {
    console.error('Seeding failed:', e.response?.data || e.message);
    process.exit(1);
  }
}

run();

