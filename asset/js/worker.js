onmessage = function(e){
    const data = e.data;
    if(data.duration){
        timer(data.duration);
    }
}

function timer(_duration){
    let duration = _duration;
    let alarm = false;
    const interval = setInterval(() => {
        if(!alarm && duration < 3 * 60 * 1000 + 1000){
            postMessage({alarm : true, stringTimer : stringTimer(duration)});
            alarm = true;
        }
        else{
            postMessage({alarm : false, stringTimer : stringTimer(duration)});
        }
        if(duration <= 0){
            postMessage({end : true, stringTimer : stringTimer(duration)});
            clearInterval(interval);
        }
        duration -= 50;
    }, 50);
}

function stringTimer(milliseconds){
    const seconds = milliseconds / 1000;
    const h = (seconds / 3600 | 0).toString().padStart(2, '0');
    const m = (seconds % 3600 / 60 | 0).toString().padStart(2, '0');
    const s = (seconds % 60 | 0).toString().padStart(2, '0');
    return [h, m, s].join(':');
}