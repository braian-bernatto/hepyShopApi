const apiRouter = require('express').Router()
const cors = require('cors')
const { check } = require('express-validator')
const { apiGetCategorias } = require('./controllers/categoriaController')
const { apiGetEstados } = require('./controllers/estadoController')
const {
  apiAgregarProducto,
  apiExisteProducto,
  apiEliminarProducto,
  apiModificarProducto,
  apiGetProductos,
  apiGetAllProductosID,
  apiGetProductoByID
} = require('./controllers/productoController')
const { apiGetUnidadesMedida } = require('./controllers/unidadMedidaController')
const {
  apiRegistrarUsuario,
  apiAutenticarUsuario,
  apiAprobarUsuario,
  apiGetUsuarios
} = require('./controllers/usuarioController')
const auth = require('./middleware/auth')
const isAdmin = require('./middleware/isAdmin')
const isAprobado = require('./middleware/isAprobado')

apiRouter.use(
  cors({
    origin: '*'
  })
)

apiRouter.get('/', (req, res) => {
  res.json('Shop API is running successfully')
})

//usuarios
apiRouter.get('/usuarios', auth, isAdmin, apiGetUsuarios)

apiRouter.post(
  '/usuario',
  [
    check('nombre')
      .not()
      .isEmpty()
      .withMessage('El nombre es obligatorio')
      .isString('El nombre debe ser una cadena de texto'),
    check('correo')
      .not()
      .isEmpty()
      .withMessage('El correo es obligatorio')
      .isEmail()
      .withMessage('Ingrese un correo valido'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('La contraseña es obligatoria')
  ],
  apiRegistrarUsuario
)

apiRouter.post(
  '/login',
  [
    check('correo')
      .not()
      .isEmpty()
      .withMessage('El correo es obligatorio')
      .isEmail()
      .withMessage('Ingrese un correo valido'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('La contraseña es obligatoria')
  ],
  apiAutenticarUsuario
)

apiRouter.post(
  '/usuario/aprobar',
  auth,
  isAdmin,
  [
    (check('correo')
      .not()
      .isEmpty()
      .withMessage('El correo es obligatorio')
      .isEmail()
      .withMessage('Ingrese un correo valido'),
    check('aprobado')
      .not()
      .isEmpty()
      .withMessage('Aprobación es obligatoria')
      .isBoolean())
  ],
  apiAprobarUsuario
)

//productos
apiRouter.get('/productos/enlaces', apiGetAllProductosID)
apiRouter.get('/productos', apiGetProductos)
apiRouter.get('/producto/:id', apiGetProductoByID)
apiRouter.post(
  '/producto',
  auth,
  isAprobado,
  [
    (check('producto_nombre')
      .not()
      .isEmpty()
      .withMessage('El nombre es obligatorio')
      .isString('El nombre debe ser una cadena de texto'),
    check('estado_producto_id')
      .not()
      .isEmpty()
      .withMessage('El estado es obligatorio')
      .isNumeric()
      .withMessage('El estado debe ser numérico')
      .toInt(),
    check('producto_cantidad')
      .not()
      .isEmpty()
      .withMessage('Cantidad es obligatoria')
      .isNumeric()
      .withMessage('Cantidad debe ser numérica')
      .toInt(),
    check('unidad_medida_id')
      .not()
      .isEmpty()
      .withMessage('Unidad de medida es obligatoria')
      .isNumeric()
      .withMessage('Unidad de medida debe ser numérica')
      .toInt(),
    check('categorias.*')
      .isNumeric()
      .toInt()
      .withMessage('Las categorias deben ser numéricas'))
  ],
  apiAgregarProducto
)

apiRouter.put(
  '/producto/:id',
  auth,
  isAprobado,
  [
    (check('producto_nombre')
      .not()
      .isEmpty()
      .withMessage('El nombre es obligatorio')
      .isString('El nombre debe ser una cadena de texto'),
    check('estado_producto_id')
      .not()
      .isEmpty()
      .withMessage('El estado es obligatorio')
      .isNumeric()
      .withMessage('El estado debe ser numérico')
      .toInt(),
    check('producto_cantidad')
      .not()
      .isEmpty()
      .withMessage('Cantidad es obligatoria')
      .isNumeric()
      .withMessage('Cantidad debe ser numérica')
      .toInt(),
    check('unidad_medida_id')
      .not()
      .isEmpty()
      .withMessage('Unidad de medida es obligatoria')
      .isNumeric()
      .withMessage('Unidad de medida debe ser numérica')
      .toInt(),
    check('eliminar_foto.*')
      .isString()
      .withMessage('Las url de las imagenes deben ser un string')
      .optional({ nullable: true, checkFalsy: true }))
  ],
  apiModificarProducto
)

apiRouter.get('/producto/existe', auth, apiExisteProducto)

apiRouter.delete('/producto/:id', auth, isAprobado, apiEliminarProducto)

//referenciales
apiRouter.get('/estados-producto', apiGetEstados)
apiRouter.get('/categorias-producto', apiGetCategorias)
apiRouter.get('/unidades-medida', apiGetUnidadesMedida)

module.exports = apiRouter
