let localStream;
let remoteStream;
let peerConnection;
let icy = [];
let flag = false;
const socket = io.connect("http://localhost:3000");
const servers ={
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302']
            }
    ]

}
socket.on('connect', ()=>{
    console.log(socket.id);
})

socket.on('consuccess', (data)=>{
    console.log(data);
    if(flag==false){
    socket.emit('callreq', socket.id);
    }
})

socket.on('rejectcall', (data)=>{
    console.log(data);
    flag = true;
})

socket.on('sendsdp', (data)=>{
    createOffer(data);

})

socket.on('sendans', (data)=>{
    createAnswer(data);
})

socket.on('setyouremo', (data)=>{
    peerConnection.setRemoteDescription(data.ans);
})

socket.on('ice1set', (data)=>{
    for(i of data.ice){
        peerConnection.addIceCandidate(i);
    }
})

socket.on('ice2set', (data)=>{
    for(i of data.ice){
        peerConnection.addIceCandidate(i);
    }
})


const init = async ()=>{
    localStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
    document.getElementById('user-1').srcObject = localStream;
    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;
}

const createOffer = async (data)=>{
    peerConnection = new RTCPeerConnection(servers);
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    
    offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    peerConnection.onicecandidate = async (event)=>{
        icy.push(event.candidate);

    }

    peerConnection.onicegatheringstatechange = async ()=>{
        if(peerConnection.iceGatheringState==="complete"){
            socket.emit('ice1', {ice: icy, send: socket.id, rec: data.send});
        }
    }

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

    socket.emit('sentoff', {off: offer, send: socket.id, rec: data.send})
}

const createAnswer = async (data)=>{
    peerConnection = new RTCPeerConnection(servers);
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

    peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
        });
    };
    
    peerConnection.setRemoteDescription(data.off);
    answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);

    peerConnection.onicecandidate = async (event)=>{
        icy.push(event.candidate);

    }

    peerConnection.onicegatheringstatechange = async ()=>{
        if(peerConnection.iceGatheringState==="complete"){
            socket.emit('ice2', {ice: icy, send: socket.id, rec: data.send});
        }
    }

    

    
    socket.emit('setremo', {ans: answer, send: socket.id, rec: data.send});
}

init();