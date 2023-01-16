const CategoriaProducto = require('../models/CategoriaProducto')

exports.apiGetCategorias = async (req, res) => {
  try {
    const respuesta = await CategoriaProducto.allCategorias()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}
