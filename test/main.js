let stream
let remoteStream
let peerConnection

const servers = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
}

//INITIAL FACE VIDEO STREAM
const initial = async () => {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    document.querySelector("main #myCamera").srcObject = stream
}


//CREATING THE SDP OFFER
const createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    //creating the tracks
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };
    
    //creating the stream for the remote user
    remoteStream = new MediaStream()
    document.querySelector("main #remoteCamera").srcObject = remoteStream


    //getting the new ice candidate
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            document.querySelector("main .offer").innerText = JSON.stringify(peerConnection.localDescription)
        }
    }

    //creating the offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    document.querySelector("main .offer").innerText = JSON.stringify(offer)
    console.log("Created the offer")
}
initial()


//CREATING THE ANSWER
const createAnswer=()=>{
    alert("Creating the answer")
}