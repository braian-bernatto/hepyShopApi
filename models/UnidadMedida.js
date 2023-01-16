const pool = require('../db')

const UnidadMedida = function (data) {
  this.data = data
  this.errors = []
}

UnidadMedida.allUnidades = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const unidades = await pool.query(`select * from unidad_medida`)

      if (unidades.length) {
        resolve(unidades)
        return unidades
      } else {
        reject({ msg: 'No hay unidades de medida registradas' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = UnidadMedida
