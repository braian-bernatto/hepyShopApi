const Usuario = require('../models/Usuario')

module.exports = async (req, res, next) => {
  try {
    const isAdmin = await Usuario.verificarAdmin(req.usuario.correo)
    console.log(isAdmin)
    if (isAdmin[0].usuario_admin) {
      next()
    } else {
      res.status(403).json({
        msg: 'Usuario no es Admin'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
}
