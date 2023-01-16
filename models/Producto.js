const pool = require('../db')
const pgp = require('pg-promise')({ capSQL: true })
const fs = require('fs')

const Producto = function (data, images) {
  this.data = data
  this.images = images
  this.errors = []
}

const cs = new pgp.helpers.ColumnSet(
  [
    'producto_nombre',
    'estado_producto_id',
    'producto_cantidad',
    'unidad_medida_id'
  ],
  { table: 'producto' }
)

Producto.prototype.agregarProducto = async function () {
  return new Promise(async (resolve, reject) => {
    this.data.categorias = this.data.categorias.split(',')
    try {
      const productoExiste = await Producto.existeProducto(
        this.data.producto_nombre
      )
      if (productoExiste) {
        reject({ msg: 'El producto ya existe' })
        return
      }

      if (!this.errors.length) {
        const query =
          pgp.helpers.insert(this.data, cs) + ' returning producto_id'

        pool
          .tx(async t => {
            const { producto_id } = await t.one(query)
            this.data.categorias.map(async categoria => {
              await t.none(
                `INSERT INTO categoria_detalle(categoria_producto_id, producto_id) values($1, $2)`,
                [categoria, +producto_id]
              )
            })
            if (this.images.length) {
              this.images.map(async image => {
                const url = image.destination + '/' + image.filename
                await t.none(
                  `INSERT INTO imagen(imagen_url, producto_id) values($1, $2)`,
                  [url, +producto_id]
                )
              })
            }
            return { producto_id }
          })
          .then(data => {
            resolve(data)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      } else {
        console.log('Hubo un error')
        reject(this.errors)
      }
    } catch (error) {
      this.errors.push('Please try again later...')
      console.log(error)
      reject(this.errors)
    }
  })
}

Producto.prototype.modificarProducto = async function (id) {
  this.data.categorias = this.data.categorias.split(',')

  if (this.data.eliminar_foto && !Array.isArray(this.data.eliminar_foto)) {
    this.data.eliminar_foto = [this.data.eliminar_foto]
  }
  return new Promise(async (resolve, reject) => {
    try {
      //verificar que existe producto
      const productoExiste = await Producto.existeProductoById(id)
      if (!productoExiste) {
        //eliminar fotos cargadas
        if (this.images.length) {
          this.images.forEach(url => {
            Producto.eliminarFoto(`public/images/${url.filename}`)
          })
        }
        reject({ msg: 'El producto no existe' })
        return
      }

      //armar estructura de query
      if (!this.errors.length) {
        const condition = pgp.as.format(' where producto_id = $1', id)

        const query = pgp.helpers.update(this.data, cs) + condition

        pool
          .tx(async t => {
            await t.none(query)

            await t.none(
              `delete from categoria_detalle where producto_id = $1`,
              id
            )

            this.data.categorias.map(async categoria => {
              await t.none(
                `INSERT INTO categoria_detalle(categoria_producto_id, producto_id) values($1, $2)`,
                [categoria, id]
              )
            })

            //verificar la cantidad de fotos a agregar
            const cantidadFotosExistentes = await Producto.revisarCantidadFotos(
              id
            )
            const cantidadFotosEliminar = this.data.eliminar_foto
              ? this.data.eliminar_foto.length
              : 0
            let cantidadPermitidaFotos = 3
            cantidadFotosExistentes - cantidadFotosEliminar

            //eliminar fotos seleccionadas
            if (cantidadFotosEliminar) {
              this.data.eliminar_foto.forEach(async url => {
                Producto.eliminarFoto(url)
                await t.none(
                  `delete from imagen where imagen_url ilike $1`,
                  url
                )
              })
            }

            //agregar las nuevas fotos
            if (this.images.length) {
              this.images.forEach(async (image, index) => {
                if (index == cantidadPermitidaFotos) return
                const url = image.destination + '/' + image.filename
                await t.none(
                  `INSERT INTO imagen(imagen_url, producto_id) values($1, $2)`,
                  [url, id]
                )
              })
            }
            return {
              msg: `El producto ${this.data.producto_nombre}  ha sido modificado exitosamente`
            }
          })
          .then(data => {
            resolve(data)
          })
          .catch(error => {
            console.log(error)
            reject(error)
          })
      } else {
        console.log('Hubo un error')
        reject(this.errors)
      }
    } catch (error) {
      this.errors.push('Please try again later...')
      console.log(error)
      reject(this.errors)
    }
  })
}

Producto.revisarCantidadFotos = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const { count } = await pool.one(
        `select count(*) from imagen where producto_id = $1`,
        [id]
      )
      resolve(count)
    } catch (error) {
      reject(error)
      console.log(error)
    }
  })
}

Producto.eliminarFoto = function (url) {
  fs.unlink(url, err => {
    if (err) {
      console.log(err)
    }
    console.log(`${url.split('/')[2]} eliminado`)
  })
}

Producto.eliminarProducto = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const productoExiste = await Producto.existeProductoById(id)
      if (!productoExiste) {
        reject({ msg: 'El producto no existe' })
        return
      }

      const rutas = await Producto.imagenesProductoById(id)
      rutas.forEach(ruta => Producto.eliminarFoto(ruta.imagen_url))

      pool.tx(async t => {
        await t.none(`delete from imagen where producto_id = $1`, id)
        await t.none(`delete from categoria_detalle where producto_id = $1`, id)
        const nombreProducto = await t.one(
          `delete from producto where producto_id = $1 returning producto_nombre`,
          id
        )
        resolve({
          msg: `El producto '${nombreProducto.producto_nombre}' se ha eliminado satisfactoriamente`
        })
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Producto.existeProducto = async function (producto) {
  return new Promise(async (resolve, reject) => {
    try {
      const { exists } = await pool.one(
        `select exists (select * from producto where producto_nombre ilike $1)`,
        [producto]
      )
      resolve(exists)
    } catch (error) {
      reject(error)
      console.log(error)
    }
  })
}

Producto.existeProductoById = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const { exists } = await pool.one(
        `select exists (select * from producto where producto_id = $1)`,
        [id]
      )

      resolve(exists)
    } catch (error) {
      reject(error)
      console.log(error)
    }
  })
}

Producto.imagenesProductoById = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const resultado = await pool.any(
        `select imagen_url from imagen where producto_id = $1`,
        [id]
      )
      resolve(resultado)
    } catch (error) {
      reject(error)
      console.log(error)
    }
  })
}

Producto.allProductosID = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const resultado = await pool.any(`select producto_id from producto`, [id])
      resolve(resultado)
    } catch (error) {
      reject(error)
      console.log(error)
    }
  })
}

Producto.allProductos = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      pool
        .task(async t => {
          const productos = await t.any(
            `select * from producto natural join estado_producto natural join unidad_medida`
          )

          const detallesProducto = productos.map(async product => {
            const categorias = await t.any(
              `select * from categoria_producto where categoria_producto_id in (select categoria_producto_id from categoria_detalle where producto_id = $1)`,
              product.producto_id
            )

            const imagenes = await t.any(
              `select * from imagen where producto_id = $1`,
              product.producto_id
            )

            return {
              ...product,
              categorias,
              imagenes
            }
          })

          const details = await t.batch(detallesProducto)
          return details
        })
        .then(data => resolve(data))
        .catch(error => reject(error))
    } catch (error) {
      console.log(error)
    }
  })
}

Producto.productoByID = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      pool
        .task(async t => {
          const productos = await t.any(
            `select * from producto natural join estado_producto natural join unidad_medida where producto_id = $1`,
            id
          )

          const detallesProducto = productos.map(async product => {
            const categorias = await t.any(
              `select * from categoria_producto where categoria_producto_id in (select categoria_producto_id from categoria_detalle where producto_id = $1)`,
              id
            )

            const imagenes = await t.any(
              `select * from imagen where producto_id = $1`,
              id
            )

            return {
              ...product,
              categorias,
              imagenes
            }
          })

          const details = await t.batch(detallesProducto)
          return details
        })
        .then(data => resolve(data))
        .catch(error => reject(error))
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = Producto
