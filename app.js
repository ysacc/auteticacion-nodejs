const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'tu_clave_secreta';
const MAX_LOGIN_ATTEMPTS = 3;
const SESSION_DURATION = '24h';

// Simulación de una base de datos de usuarios
const users = [
    { username: 'ysacc', password: 'clavesecreta' },
  ];

// Almacenar intentos de inicio de sesión
const loginAttempts = new Map();

app.use(bodyParser.json());

// Middleware para verificar el token de sesión
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token no válido' });
    }

    req.user = decoded;
    next();
  });
};

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario ha excedido el límite de intentos
  const attempts = loginAttempts.get(username) || 0;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return res.status(401).json({ message: 'Demasiados intentos. Inténtelo más tarde.' });
  }
  // Buscar el usuario en la simulación de la base de datos
  const user = users.find(u => u.username === username && u.password === password);

  // Validar credenciales 
  if (user) {
    // Crear y firmar el token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: SESSION_DURATION });

    // Restablecer intentos después de un inicio de sesión exitoso
    loginAttempts.set(username, 0);

    res.json({ token });
  } else {
    // Incrementar el contador de intentos fallidos
    loginAttempts.set(username, attempts + 1);

    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

// Ruta protegida que requiere el token de sesión
app.get('/recurso-protegido', verifyToken, (req, res) => {
  res.json({ message: 'Acceso permitido al recurso protegido' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
