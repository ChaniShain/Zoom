const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
// ...
app.use(cookieParser());
// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', `default-src *; script-src * 'nonce-${nonce}'`);
//     return next();
// });
// const cors = require('cors');
// app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', 'default-src *');
//     return next();
// });
const server = require("http").Server(app);
const io = require("socket.io")(server)
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
app.get('/:login', (req, res) => {
    res.render('login', { roomId: req.params.login });

});

// app.post('/:login', (req, res) => {
//     console.log('Form submitted:', req.body);
//     const { username } = req.body;
//     const roomId = uuidv4();
//     // Redirect to the room with the username as a query parameter
//     res.redirect(`/:room/${roomId}`);
// });
// app.post('/login', (req, res) => {
//     const { username, room } = req.body;
//     console.log("-post")
//     res.redirect(`/room/${room}?username=${username}`);
// });

app.post('/:login', (req, res) => {
    const { username, roomId } = req.body;
    console.log(`Login request received. Username: ${username}, Room ID: ${roomId}`);
    res.cookie('username', username);    // Perform any necessary validation/authentication here

    // Redirect to the room page after successful login
    console.log(`Redirecting to /${roomId}`);
    res.render('room', {roomId: roomId });
});

// app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room });
// })

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('User joined room:', roomId, 'with ID:', userId);
        socket.join(roomId);

        socket.broadcast.to(roomId).emit("user-connected", userId);
        // socket.to(roomId).emit("user-connected");



        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('emoji', emoji => {
            io.to(roomId).emit('emoji-selected', emoji)
        })



        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})



server.listen(3030);



// {{1, 5}, {4, 5}},//קו אחד
// {{2, 5}, {10, 1}}
// ,{{3, 2}, {10, 3}}
// ,{{6, 4}, {9, 4}}
// ,{{7, 1}, {8, 1}}

// //
// {{1, 5}, {4, 5}}, {{2, 5}, {10, 1}}
// // --------------------------------
// {{2, 5}, {10, 1}},{{3, 2}, {10, 3}}.