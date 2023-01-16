const pool = require('../db')

const EstadoProducto = function (data) {
  this.data = data
  this.errors = []
}

EstadoProducto.allEstados = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const estados = await pool.query(`select * from estado_producto`)

      if (estados.length) {
        resolve(estados)
        return estados
      } else {
        reject({ msg: 'No hay estados registrados' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = EstadoProducto
