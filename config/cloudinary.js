const cloudinary = require('cloudinary');
const config = require('config');
const cloudName = config.get('cloud_name');
const apiKey = config.get('api_key');
const apiSecret = config.get('api_secret');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});


module.exports = cloudinary;