const pool = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Usuario = function (data) {
  this.data = data
  this.errors = []
}

Usuario.prototype.registrarUsuario = async function () {
  const { nombre, correo, password } = this.data
  return new Promise(async (resolve, reject) => {
    try {
      const existe = await Usuario.verificarCorreo(correo)
      if (existe) {
        reject({
          msg: 'El usuario ya existe'
        })
        return null
      }

      if (!this.errors.length) {
        bcrypt.hash(password, 10, async function (err, hash) {
          const resultado = await pool.query(`INSERT INTO usuario(
            usuario_nombre, usuario_password, usuario_correo, usuario_aprobado)
            VALUES ('${nombre}', '${hash}', '${correo}', false) returning usuario_id`)
          resolve(resultado)
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

Usuario.aprobarUsuario = async function (correo, aprobado) {
  return new Promise(async (resolve, reject) => {
    try {
      const existe = await Usuario.verificarCorreo(correo)
      if (!existe) {
        reject({
          msg: 'El usuario no existe'
        })
        return null
      }
      const resultado = await pool.query(
        `UPDATE usuario SET usuario_aprobado=${aprobado} WHERE usuario_correo ilike '${correo}' returning usuario_nombre`
      )

      resolve(
        `El usuario ${resultado[0].usuario_nombre} ha sido ${
          aprobado ? 'aprobado' : 'desaprobado'
        } con éxito`
      )
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

Usuario.autenticarUsuario = async function (correo, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const usuario = await Usuario.verificarCorreo(correo)

      if (!usuario.length) {
        reject({
          msg: 'El usuario no existe'
        })
        return null
      } else {
        if (bcrypt.compareSync(password, usuario[0].usuario_password)) {
          const token = jwt.sign(
            {
              nombre: usuario[0].usuario_nombre,
              correo: correo,
              aprobado: usuario[0].usuario_aprobado,
              isAdmin: usuario[0].usuario_admin
            },
            process.env.SECRETA,
            { expiresIn: '24h' }
          )
          resolve({
            token,
            nombre: usuario[0].usuario_nombre,
            correo: correo,
            aprobado: usuario[0].usuario_aprobado,
            isAdmin: usuario[0].usuario_admin
          })
        } else {
          reject({ msg: 'Password Incorrecto' })
          return null
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}

Usuario.verificarCorreo = async function (correo) {
  return new Promise(async (resolve, reject) => {
    try {
      const usuario = await pool.query(
        `select * from usuario where usuario_correo ilike '${correo}'`
      )

      if (usuario.length) {
        resolve(usuario)
        return usuario
      } else {
        resolve(false)
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

Usuario.verificarAdmin = async function (correo) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdmin = await pool.query(
        `select usuario_admin from usuario where usuario_correo ilike '${correo}'`
      )

      if (isAdmin.length) {
        resolve(isAdmin)
        return isAdmin
      } else {
        reject({ msg: 'Usuario no existe' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

Usuario.verificarAprobado = async function (correo) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdmin = await pool.query(
        `select usuario_aprobado from usuario where usuario_correo ilike '${correo}'`
      )

      if (isAdmin.length) {
        resolve(isAdmin)
        return isAdmin
      } else {
        reject({ msg: 'Usuario no existe' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

Usuario.allUsuarios = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      const usuarios = await pool.query(
        `select usuario_id, usuario_nombre, usuario_correo, usuario_aprobado, usuario_admin from usuario`
      )

      if (usuarios.length) {
        resolve(usuarios)
        return usuarios
      } else {
        reject({ msg: 'No hay usuarios registrados' })
        return null
      }
    } catch (error) {
      console.log(error)
    }
  })
}

module.exports = Usuario
