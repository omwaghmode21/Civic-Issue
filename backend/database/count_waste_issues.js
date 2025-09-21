// Script to count issues in the 'Waste Management' category
const mongoose = require('mongoose');
const Issue = require('./models/Issue');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error('MONGODB_URL not set in environment.');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const count = await Issue.countDocuments({ category: 'Waste Management' });
  console.log(`Waste Management issues: ${count}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
