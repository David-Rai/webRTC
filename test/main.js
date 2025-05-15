
const servers = {
    iceservers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
}

//INITIAL FACE VIDEO STREAM
const initial = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    document.querySelector("main #myCamera").srcObject = stream
}

let peerConnection;
//CREATING THE SDP OFFER
const createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    const remoteStream = new MediaStream()
    document.querySelector("main #remoteCamera").srcObject = remoteStream

    //creating the offer
    let offer=await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
}
initial()