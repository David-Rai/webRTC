let stream
let remoteStream
let peerConnection

const servers = {
    iceservers: [
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

    //creating the stream for the remote user
    remoteStream = new MediaStream()
    document.querySelector("main #remoteCamera").srcObject = remoteStream

    //creating the tracks
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
    })

    peerConnection.ontrack = async (e) => {
        e.streams[0].forEach(track => {
            remoteStream.addTrack(track)
        })
    }

    //creating the offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    document.querySelector("main .offer").innerText = JSON.stringify(offer)
    console.log("Created the offer")
}
initial()