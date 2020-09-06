require('dotenv').config()

const baseConfig = {
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseKey: process.env.AIRTABLE_BASE_KEY,
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
    username: process.env.MAPBOX_USERNAME,
  },
}

module.exports = baseConfig
