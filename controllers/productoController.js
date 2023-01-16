const { verificarErrores } = require('../helpers/validatorHelper')
const Producto = require('../models/Producto')

exports.apiGetAllProductosID = async (req, res) => {
  try {
    const respuesta = await Producto.allProductosID()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiGetProductos = async (req, res) => {
  try {
    const respuesta = await Producto.allProductos()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiGetProductoByID = async (req, res) => {
  try {
    const respuesta = await Producto.productoByID(req.params.id)
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiAgregarProducto = async (req, res) => {
  verificarErrores(req, res)
  try {
    const respuesta = await new Producto(req.body, req.files).agregarProducto()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiModificarProducto = async (req, res) => {
  verificarErrores(req, res)
  try {
    const respuesta = await new Producto(req.body, req.files).modificarProducto(
      req.params.id
    )
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiEliminarProducto = async (req, res) => {
  try {
    const respuesta = await Producto.eliminarProducto(req.params.id)
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiExisteProducto = async (req, res) => {
  try {
    const respuesta = await Producto.existeProducto(req.query.nombre)
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}
