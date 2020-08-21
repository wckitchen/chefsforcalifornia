require('dotenv').config()

const baseConfig = {
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseKey: process.env.AIRTABLE_BASE_KEY,
  },
}

module.exports = baseConfig
