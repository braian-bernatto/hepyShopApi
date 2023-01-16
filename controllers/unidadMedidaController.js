const UnidadMedida = require('../models/UnidadMedida')

exports.apiGetUnidadesMedida = async (req, res) => {
  try {
    const respuesta = await UnidadMedida.allUnidades()
    res.json(respuesta)
  } catch (error) {
    res.status(500).send(error)
  }
}
