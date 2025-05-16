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

        //creating the stream for the remote user
        remoteStream = new MediaStream()
        document.querySelector("main #remoteCamera").srcObject = remoteStream

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
    
    //event listeners for finding the ice candidate
    peerConnection.onicecandidate=async (event)=>{
        if(event.candidate){
    document.querySelector("main .offer").innerText = JSON.stringify(peerConnection.localDescription)
        }
    }

    //creating the offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    document.querySelector("main .offer").innerText = JSON.stringify(offer)
    console.log("offer created..")
}
initial()


//CREATING THE ANSWER
const createAnswer=async ()=>{
    console.log("creating the answer")
    peerConnection = new RTCPeerConnection(servers)

    //creating the stream for the remote user
    remoteStream = new MediaStream()
    document.querySelector("main #remoteCamera").srcObject = remoteStream

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

//event listeners for finding the ice candidate
peerConnection.onicecandidate=async (event)=>{
    if(event.candidate){
document.querySelector("main .answer").innerText = JSON.stringify(peerConnection.localDescription)
    }
}

//creating ths SDP answer
let offer=document.querySelector("main .offer").value
offer=await JSON.parse(offer)
await peerConnection.setRemoteDescription(offer)

//creating the answer SDP
let answer=await peerConnection.createAnswer()
await peerConnection.setLocalDescription(answer)

document.querySelector("main .answer").value=JSON.stringify(answer)

}