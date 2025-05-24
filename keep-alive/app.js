let counthere = document.querySelector("h3")
let logs = document.querySelector("ul")
let count = 0

async function activate() {
    count += 1

    counthere.innerText = count
    const res = await fetch("https://webrtc-fvt3.onrender.com/")
    if (res.status === 200) {
        logs.innerHTML += `
    <Li style="backgroun-color:green;">${res.status}</li>
    `
    } else {
        logs.innerHTML += `
    <Li style="backgroun-color:red;">${res.status}</li>
    `
    }

}

setInterval(() => {
    activate()
    if(count % 10 == 0){
        logs.innerHTML=""
    }
}, 100)
