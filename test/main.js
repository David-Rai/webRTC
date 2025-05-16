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

//CREATING THE PEERCONNECTION
const createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(servers)
}

//CREATING THE REMOTE STREAM
const createRemoteStream = () => {
    //creating the stream for the remote user
    remoteStream = new MediaStream()
    document.querySelector("main #remoteCamera").srcObject = remoteStream
}

//ADDING THE STREAM TRACKS
const addTracks = () => {
    //sending the track to the remote user
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
    })

    //getting  the remote track and showing into the webpage
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };

}

//Adding the ICE candidate
const addICE = (field) => {
    peerConnection.onicecandidate = async event => {
        if (event.candidate) {
            document.querySelector(field).innerText = JSON.stringify(peerConnection.localDescription)
        }
    }
}

//CREATING THE SDP OFFER
const createOffer = async () => {
    createPeerConnection()
    createRemoteStream()
    addTracks()
    addICE("main .offer")

    //creating the offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    document.querySelector("main .offer").innerText = JSON.stringify(offer)
}

initial()


//CREATING THE ANSWER
const createAnswer = async () => {
    createPeerConnection()
    createRemoteStream()
    addTracks()
    addICE("main .answer")

    //creating ths SDP answer
    let offer = document.querySelector("main .offer").value
    if (offer === "") {
        return alert("Add the offer from peer")
    }
    offer = await JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)

    //creating the answer SDP
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    document.querySelector("main .answer").value = JSON.stringify(answer)
}



//ADDING THE ANSWER
const addAnswer = async () => {

    //getting the answer
    let answer = document.querySelector("main .answer").value
    if (answer === "") {
        return alert("Add answer from another peer")
    }
    answer = await JSON.parse(answer)

    //Adding the remote description
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}