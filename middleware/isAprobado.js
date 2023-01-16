const Usuario = require('../models/Usuario')

module.exports = async (req, res, next) => {
  try {
    const isAprobado = await Usuario.verificarAprobado(req.usuario.correo)
    console.log(isAprobado)
    if (isAprobado[0].usuario_aprobado) {
      next()
    } else {
      res.status(403).json({
        msg: 'Usuario no esta Aprobado'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
}
