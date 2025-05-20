async function activate(){
    const res=await fetch("https://webrtc-fvt3.onrender.com/")
    console.log(res)
}
activate()