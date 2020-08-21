const Airtable = require('airtable')
const config = require('./config')

const base = new Airtable({ apiKey: config.airtable.apiKey }).base(
  config.airtable.baseKey
)

function getAllFires() {
  return new Promise((resolve, reject) => {
    let results = []

    base('Fire Name')
      .select()
      .eachPage(
        (records, fetchNextPage) => {
          results = [...results, ...records]
          fetchNextPage()
        },
        (err) => {
          if (err) return reject(err)
          resolve(results)
        }
      )
  })
}

getAllFires()
  .then((records) => {
    console.log(records.map((record) => record.id))
  })
  .catch((err) => {
    console.error(err)
  })
