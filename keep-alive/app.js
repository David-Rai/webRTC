async function activate(){
    console.log("fetching the data")
    const res=await fetch("https://webrtc-fvt3.onrender.com/")
    console.log(res)
}
activate()