import { useEffect, useRef, useState } from "react"
import { socket } from './socket';


function Timer({on, totalTime, roomID}) {
    const [trigger, setIt] = useState(true);
    let time = totalTime;
    let [startTime, setStartTime] = useState(null);
    let [currTime, setCurrTime] = useState(null);
    const onRef = useRef(0);

    useEffect(() => {
        socket.on("move", obj => {
            onRef.current = 1 - onRef.current;
            if(onRef.current === on){
                console.log(totalTime * 1000 - (new Date().getTime() - startTime), startTime)
            }else{
                setCurrTime(totalTime * 1000 - (new Date().getTime() - startTime));
                currTime = (totalTime * 1000 - (new Date().getTime() - startTime));
                totalTime = currTime / 1000;
            }
        });

        socket.emit("getTimer", {roomID : roomID});
        
        socket.on("timer", (message) => {
            //console.log(onRef.current, on);
            if(onRef.current === on){
                setStartTime(prev => message.start);
                startTime = message.start;
            }
        });
    }, []);
    useEffect(() => {
       // console.log(startTime);
        if(on === onRef.current){ 
            setCurrTime(totalTime * 1000 - (new Date().getTime() - startTime));
            currTime = (totalTime * 1000 - (new Date().getTime() - startTime));
        }
        setTimeout(() => {
            setIt(prev => !prev);
        }, 1000);
    }, [trigger]);
    
    return(
        <div className="">
            {
                currTime
            }
        </div>
    )
}

export default Timer 