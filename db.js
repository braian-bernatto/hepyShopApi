require('dotenv').config()

const Pool = require('pg-promise')({ capSQL: true })
const pool = Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: process.env.PGHOST == 'localhost' ? false : { rejectUnauthorized: false }
})

module.exports = pool
