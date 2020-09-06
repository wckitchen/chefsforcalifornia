const Airtable = require('airtable')
const FormData = require('form-data')
const axios = require('axios')

const config = require('./config')

const base = new Airtable({ apiKey: config.airtable.apiKey }).base(
  config.airtable.baseKey
)

const recipients = {
  // Find all recipients in airtable (all pages)
  // Resolves with a list of airtable recipient objects
  findAll() {
    return new Promise((resolve, reject) => {
      let results = []

      base('Recipients')
        .select()
        .eachPage(
          (records, fetchNextPage) => {
            results = [...results, ...records]
            fetchNextPage()
          },
          async (err) => {
            if (err) return reject(err)
            resolve(results)
          }
        )
    })
  },
}

const fires = {
  // Find a single fire in airtable
  // Resolves with an airtable fire object
  findById(id) {
    return new Promise((resolve, reject) => {
      base('Fire Name').find(id, (err, record) => {
        if (err) return reject(err)
        resolve(record)
      })
    })
  },
}

const mts = {
  // Creates or replaces a tileset source in mapbox
  // Resolves with axios HTTP response from mapbox
  replaceTilesetSource({ id, features }) {
    const formData = new FormData()
    formData.append(
      'file',
      features.map(JSON.stringify).join('\n'),
      'data.geojson.ld'
    )

    return axios({
      url: `https://api.mapbox.com/tilesets/v1/sources/${config.mapbox.username}/${id}`,
      method: 'PUT',
      headers: {
        ...formData.getHeaders(),
      },
      params: {
        access_token: config.mapbox.accessToken,
      },
      data: formData,
    })
  },

  // Creates a tileset in mapbox
  // Resolves with axios HTTP response from mapbox
  createTileset({ name, tilesetSourceUrl }) {
    console.log(tilesetSourceUrl)
    return axios({
      url: `https://api.mapbox.com/tilesets/v1/${config.mapbox.username}.${name}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        access_token: config.mapbox.accessToken,
      },
      data: {
        recipe: {
          version: 1,
          layers: {
            recipients: {
              source: tilesetSourceUrl,
              minzoom: 4,
              maxzoom: 8,
            },
          },
        },
        name,
      },
    })
  },

  publishTileset({ tilesetId }) {
    return axios({
      url: `https://api.mapbox.com/tilesets/v1/${tilesetId}/publish`,
      method: 'POST',
      params: {
        access_token: config.mapbox.accessToken,
      },
    })
  },
}

// Converts an airtable recipient object to a GeoJSON-serializable feature
// Joins fire name via foreign key
// Resolves with JSON object
async function toFeature(recipient) {
  const fireId = recipient.get('Fire')[0]
  const fire = await fires.findById(fireId)
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [recipient.get('Long'), recipient.get('Lat')],
    },
    properties: {
      Name: recipient.get('Name'),
      Type: recipient.get('Type'),
      Status: recipient.get('Status'),
      Fire: fire.get('Name'),
      'Meal Count': recipient.get('Meal Cnt'),
    },
  }
}

async function main() {
  const tilesetSourceId = '2020_CA_Source'
  const tilesetName = '2020_CA'
  try {
    const atRecipients = await recipients.findAll()
    const features = await Promise.all(atRecipients.map(toFeature))
    // const tilesetSource = await mts.replaceTilesetSource({
    //   id: tilesetSourceId,
    //   features,
    // })
    // await mts.createTileset({
    //   name: tilesetName,
    //   tilesetSourceUrl: tilesetSource.data.id,
    // })
    const published = await mts.publishTileset({
      tilesetId: `${config.mapbox.username}.${tilesetName}`,
    })
    console.log(published)
  } catch (err) {
    console.error(err.response)
  }
}

main()
