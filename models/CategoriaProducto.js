const pool = require('../db')

const CategoriaProducto = function (data) {
  this.data = data
  this.errors = []
}

CategoriaProducto.allCategorias = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const categorias = await pool.query(`select * from categoria_producto`)

      if (categorias.length) {
        resolve(categorias)
        return categorias
      } else {
        reject({ msg: 'No hay categorias registradas' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = CategoriaProducto
