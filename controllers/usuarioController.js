const { verificarErrores } = require('../helpers/validatorHelper')
const Usuario = require('../models/Usuario')

exports.apiGetUsuarios = async (req, res) => {
  try {
    const respuesta = await Usuario.allUsuarios()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiRegistrarUsuario = async (req, res) => {
  verificarErrores(req, res)
  try {
    const respuesta = await new Usuario(req.body).registrarUsuario()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}

exports.apiAutenticarUsuario = async (req, res) => {
  verificarErrores(req, res)

  const { correo, password } = req.body

  try {
    const respuesta = await Usuario.autenticarUsuario(correo, password)
    if (respuesta.token) {
      return res.send(respuesta)
    } else {
      return res.status(400).send(respuesta)
    }
  } catch (error) {
    console.log(error)
    return res.status(403).send(error)
  }
}

exports.apiAprobarUsuario = async (req, res) => {
  verificarErrores(req, res)
  const { correo, aprobado } = req.body
  try {
    const respuesta = await Usuario.aprobarUsuario(correo, aprobado)
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}
