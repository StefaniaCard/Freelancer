require('dotenv').config();

const express = require('express');
const cors = require('cors');

const conectarDB = require('./config/conexion');

const rutasUsuarios = require('./routes/rutasUsuarios');
const rutasCanciones = require('./routes/rutasCanciones');
const rutasAuth = require('./routes/rutasAuth');

const app = express();

//conecta mi bd
conectarDB();

app.use(cors());
app.use(express.json());

app.use('/usuarios', rutasUsuarios);
app.use('/canciones', rutasCanciones);
app.use('/auth', rutasAuth);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});