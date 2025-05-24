let counthere=document.querySelector("h3")
let logs=document.querySelector("ul")
let count=0

async function activate() {
    count+=1
    counthere.innerText=count
    const res = await fetch("https://webrtc-fvt3.onrender.com/")
    logs.innerHTML +=`
    <Li>${res.status}</li>
    `
}

setInterval(() => {
    activate()
}, 14 * 60 * 1000)