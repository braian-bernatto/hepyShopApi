const EstadoProducto = require('../models/EstadoProducto')

exports.apiGetEstados = async (req, res) => {
  try {
    const respuesta = await EstadoProducto.allEstados()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}
