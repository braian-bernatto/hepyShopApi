const { validationResult } = require('express-validator')

exports.verificarErrores = (req, res) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() })
  }
}
