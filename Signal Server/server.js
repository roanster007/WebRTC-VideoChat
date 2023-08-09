const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const cors = require('cors');
const socks = new Set();

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500"
        
    },
});

io.on("connection", (socket)=>{
    console.log(socket.id);
    socks.add(socket.id);
    io.emit('consuccess', 'Connection established successfully');
    
    console.log(socks);

    socket.on('callreq', (data)=>{
        console.log('print data ',data)

        if(socks.size>1){

        

        for(i of socks){
            if(i!=data){
                console.log(`${data} call accepted by  `,i);
                socket.to(i).emit('sendsdp', {send: data, rec: i});
            }
            
            
        }
    }
    else{
        io.emit('rejectcall', 'call rejected');
        console.log('call rejected');
    }
    })

    socket.on('sentoff', (data)=>{
        io.to(data.rec).emit('sendans', {off: data.off, send: data.send, rec: data.rec});
    })

    socket.on('setremo', (data)=>{
        io.to(data.rec).emit('setyouremo', {ans: data.ans, send: data.send, rec: data.rec});
    })

    socket.on('ice1', (data)=>{
        io.to(data.rec).emit('ice1set', data);
    })
    
    socket.on('ice2', (data)=>{
        io.to(data.rec).emit('ice2set', data);
    })
})





server.listen(3000, ()=>{
    console.log('Server running on Port 3000');
})