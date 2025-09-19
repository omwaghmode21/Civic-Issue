const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DBConnection = async () => {
  const MONGO_URI = process.env.MONGODB_URL;
  const TLS_INSECURE = String(process.env.MONGO_TLS_INSECURE || '').toLowerCase() === 'true';

  if (!MONGO_URI) {
    console.error('MONGODB_URL is not set in environment.');
    return;
  }

  const isSrv = MONGO_URI.startsWith('mongodb+srv://');

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      tls: isSrv ? true : undefined,
      tlsAllowInvalidCertificates: TLS_INSECURE ? true : undefined,
    });
    console.log('DB connection established');
  } catch (error) {
    console.log('Error while connection to MongoDB', error);
  }
};

module.exports = { DBConnection };