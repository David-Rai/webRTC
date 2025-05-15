

navigator.mediaDevices.getUserMedia({video:true,audio:false})
.then(stream =>{
    document.querySelector("video").srcObject=stream
})