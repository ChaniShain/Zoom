const express = require("express");
const app = express();
// const cors = require('cors');
// app.use(cors());

const server = require("http").Server(app);
const io = require("socket.io")(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);


app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})


app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('User joined room:', roomId, 'with ID:', userId);
        socket.join(roomId);
        
        socket.broadcast.to(roomId).emit("user-connected", userId);
        // socket.to(roomId).emit("user-connected");

       
        socket.on('emoji', emoji => {
            io.to(roomId).emit('emoji-selected', emoji)
        })


        socket.on('disconnect', () => {
            //We want to broadcast on exiting of a person
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})



server.listen(3030);
