const times = document.getElementById('arrival').querySelectorAll('input');
const coordAtt = document.getElementById('coordAtt').querySelectorAll('input');
const coordScout = document.getElementById('coordScout').querySelectorAll('input');
const coordDef = document.getElementById('coordDef').querySelectorAll('input');
const siege = document.querySelector('input[type=checkbox');
const controls = document.querySelectorAll('input.control');
const results = document.getElementById('results');
const workers = [];
let speedServer = 1;
let speedAtt = 4;
let speedScout = 16;
let tsScout = 0;

controls.forEach(input => {
    input.addEventListener('focus', function(){
        this.value = '';
        this.style.borderColor = 'transparent';
    })
});

function setServer(e){
    const target = e.target.closest('.server');
    const container = e.target.closest('#servers');
    if(target){
        Array.from(container.children).forEach(child => {
            child.classList.remove('selected');
        })
        target.classList.add('selected');
        speedServer = +target.dataset.server;
    }
}

function inputCoord(element){
    const value = element.value;
    const isValid = /^-?\d{0,2}$/.test(value);
    if(!isValid){
        element.value = '';
    }
}

function inputMaxNumber(element, max){
    const value = element.value;
    const isValid = /^\d{1,2}$/.test(value);
    if(!isValid){
        element.value = '';
    }
    else{
        const num = +element.value;
        if(num > max){
            element.value = ''
        }
    }
}

function setScoutTs(element){
    tsScout = element.value ? +element.value : 0;
}

function getArrival(){
    const arr = Array.from(times).map(input => +input.value);
    const now = new Date();
    const arrival = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...arr);
    if(arrival < now){
        arrival.setDate(arrival.getDate() + 1);
    }
    return arrival;
}

function getDistance(coords1, coords2){
    const start = Array.from(coords1).map(input => +input.value);
    const end = Array.from(coords2).map(input => +input.value);
    const distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
    return distance;
}

function getSpeedAtt(element){
    speedAtt = +element.value;
}

function getSpeedScout(element){
    speedScout = +element.value;
}

function getTravelTime(distance, speedTroop, serverSpeed, ts, isSiege){
    const normalSpeed = speedTroop * serverSpeed;
    const tsSpeed = ts > 0 ? normalSpeed + normalSpeed * ts / 10 : normalSpeed;
    let travel;
    if(distance > 20){
        const difference = distance - 20;
        travel = (20 * 3600 / normalSpeed) + (difference * 3600 / tsSpeed);
    }
    else travel = distance * 3600 / normalSpeed;

    return isSiege ? travel * 2 | 0 : travel | 0;
}

function EmptyInputs(){
    let isEmpty = false;
    controls.forEach(input => {
        if(!input.value){
            input.style.borderColor = 'red';
            isEmpty = true;
        }
    })
    return isEmpty;
}

function createItemResult(type, ts, start){
    const item = document.createElement('div');
    item.classList.add('item', 'fontM');
    const title = document.createElement('div');
    title.textContent = `${type} TS ${ts} Start`;
    const startText = document.createElement('div');
    startText.textContent = start.toLocaleString().replace(',', ' - ');
    item.appendChild(title);
    item.appendChild(startText)
    return item;
}

function cardResult(tsAtt, tsScout, startAttacker, startScouter){
    const card = document.createElement('div');
    card.classList.add('player');

    const resultAtt = createItemResult('Attacker', tsAtt, startAttacker);

    const resultScout = createItemResult('Scout', tsScout, startScouter);
    
    const resultTimer = document.createElement('div');
    resultTimer.classList.add('item', 'fontM');
    const titleTimer = document.createElement('div');
    titleTimer.textContent = 'Time Left';
    const timerString = document.createElement('div');
    timerString.style.color = 'green';
    resultTimer.appendChild(titleTimer);
    resultTimer.appendChild(timerString);
    
    card.appendChild(resultAtt);
    card.appendChild(resultScout);
    card.appendChild(resultTimer);

    const duration = startScouter.getTime() - new Date().getTime();
    if(duration <= 0){
        timerString.style.color = 'red';
        timerString.textContent = 'OUT OF TIME';
    }
    else{
        const worker = new Worker('./asset/js/worker.js');
        workers.push(worker);
        worker.postMessage({duration : duration});
        worker.onmessage = function(e){
            const data = e.data;
            if(data.alarm){
                timerString.style.color = 'red';
                const audio = new Audio('./asset/media/audio/horn1.wav');
                audio.play();
            }
            if(data.end){
                timerString.style.color = 'red';
                timerString.textContent = 'OUT OF TIME';
            }
            else{
                timerString.textContent = data.stringTimer;
            }
        }
    }

    return card;
}

function calculate(element){
    element.classList.add('btnActive');
    setTimeout(() => {
        element.classList.remove('btnActive');
    }, 50);

    if(EmptyInputs()){
        workers.length = 0;
        results.innerHTML = '';
        return;
    } 
    
    workers.length = 0;
    results.innerHTML = '';
    const arrival = getArrival();
    const distanceAtt = getDistance(coordAtt, coordDef);
    const distanceScout = getDistance(coordScout, coordAtt);
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < 21; i++){
        const travelTimeAtt = getTravelTime(distanceAtt, speedAtt, speedServer, i, siege.checked);
        const travelTimeScout = getTravelTime(distanceScout, speedScout, speedServer, tsScout, false);
        const startAtt = new Date(arrival.getTime() - travelTimeAtt * 1000);
        const startScout = new Date(startAtt.getTime() - travelTimeScout * 1000);
        
        if(distanceAtt <= 20){
            const card = cardResult('0 - 20', tsScout, startAtt, startScout);
            results.appendChild(card);
            break
        }
        const card = cardResult(i, tsScout, startAtt, startScout);
        fragment.appendChild(card);
    }
    results.appendChild(fragment);    
}

