# chefsforcalifornia

## Usage

```bash
$ npm i # install dependencies
$ npm run lint # run linter
$ npm test # run ava tests
$ npm start # run main script (src/main.js)
```

### Environment variables

You will need to create a .env file in the root of this repository to store secrets required for the script to run (it will be ignored by version control):

```
AIRTABLE_API_KEY="your-api-key"
AIRTABLE_BASE_KEY="target-base-key"
```
