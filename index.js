require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')

const storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname.toLowerCase()))
  }
})

// app.use(express.urlencoded({ extended: false }))
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(express.json())
app.use(
  multer({
    storage,
    fileFilter: (req, file, cb) => {
      const types = /jpeg|jpg|png/
      const extension = types.test(file.mimetype.toLowerCase())
      const extname = types.test(path.extname(file.originalname.toLowerCase()))
      if (extension && extname) {
        return cb(null, true)
      }
      cb('error: archivo debe ser una imagen valida')
    }
  }).array('foto', 3)
)
//habilitando la carpeta publica de la api
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./router'))

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
)
