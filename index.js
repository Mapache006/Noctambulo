import express from 'express'
import logger from 'morgan'

import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.port || 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
connectionStateRecovery: {} 
   cors: {
        origin: "*" // Permite que la pagina blog se conecte
    }
})


//separador de usuario 
const animales = ['Zorro', 'Gato', 'Cuervo', 'Lobo', 'Búho', 'Polilla', 'Fantasma', 'Soñador', 'raton'];
const colores = ['Morado', 'Carmesí', 'Cian', 'Esmeralda', 'Ámbar', 'Índigo', 'Violeta', 'Gris', 'blanco'];

function generarNombre() {
    const animal = animales[Math.floor(Math.random() * animales.length)];
    const color = colores[Math.floor(Math.random() * colores.length)];
    const numero = Math.floor(Math.random() * 10000); // Genera un número del 0 al 9999 pa no repetir xd

    return `${animal} ${color} #${numero}`;
}

function getConnectedUsers() {
    const users = [];
    // io.sockets.sockets guarda a los usuarios
    for (let [id, socket] of io.sockets.sockets) {
        if (socket.username) {
            users.push(socket.username);
        }
    }
    return users;
}



// lista de jugadores
const players = {};
io.on('connection', (socket) => {
    // Nombre aleatorio///////////////////////////
    socket.username = generarNombre();

const totalWalfas = 10; 

    players[socket.id] = {//asigna nombre en el server y le da un walfa
        x: 400, 
        y: 250, 
        username: socket.username,
        avatar: Math.floor(Math.random() * totalWalfas) + 1, // Elige al azar
        facing: 1, // 1 = mira derecha, -1 = mira izquierda
        isMoving: false 
    };

    //siempre avisa cuando entran
    console.log(`Usuario conectado: ${socket.username}`);
    //entra al chat epicamente Bv
    io.emit('chat message', ` ${socket.username} ha entrado al sueño.`);

    io.emit('update users', getConnectedUsers());//agrega al contador Usrs

/////inicializa MC

socket.emit('currentPlayers', players);//muestra a todos 
    socket.broadcast.emit('newPlayer', players[socket.id], socket.id);

socket.on('playerMovement', (mov) => {
       if (players[socket.id]) {
            players[socket.id].x = mov.x;
            players[socket.id].y = mov.y;
            players[socket.id].facing = mov.facing;
            players[socket.id].isMoving = mov.isMoving;
            socket.broadcast.emit('playerMoved', players[socket.id], socket.id);
        }
    });//muestra movimientos de jugador 



    socket.on('disconnect', () => {/////////////////////////////////////
        console.log(`${socket.username} se fue a dormir...zzz`);
        //se despide
        io.emit('chat message', ` ${socket.username} se fue a dormir.`);

        io.emit('update users', getConnectedUsers()); //te bota alv del contador
        //si se desconecta tamb su mono
delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
        io.emit('update users', getConnectedUsers());

    });





    socket.on('chat message', (msg) => {///////////////////////////////
        console.log(`[${socket.username}]: ${msg}`);
        //une usuario con su msj
        io.emit('chat message', `[${socket.username}]: ${msg}`);
    });














});







app.use(logger('dev'))

app.use(express.static(process.cwd() + '/client'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})













