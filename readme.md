![React](https://img.shields.io/badge/React-18.2.0-blue)
![nodejs](https://img.shields.io/badge/nodejs-green)
![express](https://img.shields.io/badge/express-js-blue)
![webRTC](https://img.shields.io/badge/web-RTC-red)

# Core Concepts
- Intro to webRTC
- ICE (Interactive connectivity establishment)
- STUN and TURN
- Signalling
- SDE (Session description protocal)

## ICE Candidates
An ICE candidate represents a network address (IP + port) that can be used to establish a connection between peers. These are generated during the ICE gathering phase and shared between peers to find the best possible communication path.

## Architecture
<img src="https://miro.medium.com/v2/resize:fit:1400/1*NyZCgxiiaZVbzaQz9Wxvug.png"> 

# 🔄 WebRTC Connection Flow (Plain English)

This explains how two peers connect using WebRTC by exchanging SDP (Session Description Protocol) information.

1. **Peer 1:**
   - Creates an offer.
   - Calls:
     ```js
     setLocalDescription(offer) // "This is my info."
     ```
   - Sends the offer to Peer 2.

2. **Peer 2:**
   - Receives the offer.
   - Calls:
     ```js
     setRemoteDescription(offer)
     ```
   - Creates an answer.
   - Calls:
     ```js
     setLocalDescription(answer) // "This is my info."
     ```
   - Sends the answer back to Peer 1.

3. **Peer 1:**
   - Receives the answer.
   - Calls:
     ```js
     setRemoteDescription(answer)
     ```

✅ Now both peers know each other’s connection info and can establish a WebRTC connection!


# Steps to setup webRTC from scratch
1. Display current user video streams
2. create the peerConnection using RTCPeerConnection
3. Add tracks to the peerConnection
4. Add tracks to the remoteVideo
5. Adds the remote and local descriptions

## Display video stream 
```bash

const initial = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    document.querySelector("main #myCamera").srcObject = stream
}

```

## Create a SDP Offer

```bash 
const servers = {
    iceservers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
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

```

## Addind the peers tracks

```bash 

    //creating the tracks
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
    })

    peerConnection.ontrack = async (e) => {
        e.streams[0].forEach(track => {
            remoteStream.addTrack(track)
        })
    }
```

## Removing the media tracks

```bash
peerConnection.getSenders().forEach(sender => {
if(sender.track.kind==="video"){
    peerConnection.removeTrack(sender)//removing from the instance
    sender.track.stop()//stops the camera
}
})

```


















