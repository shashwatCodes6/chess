import { useEffect, useRef, useState } from "react"
import { socket } from './socket';


function Timer({on, totalTime, roomID}) {
    const [trigger, setIt] = useState(true);
    let [startTime, setStartTime] = useState(null);
    let [currTime, setCurrTime] = useState(null);
    const onRef = useRef(0);
    const totalTime1 = useRef(totalTime);
    useEffect(() => {
        socket.on("move", obj => {
            onRef.current = 1 - onRef.current;
            if(onRef.current === on){
                console.log(totalTime1.current * 1000 - (new Date().getTime() - startTime), startTime)
            }else{
                setCurrTime(totalTime1.current * 1000 - (new Date().getTime() - startTime));
                currTime = (totalTime1.current * 1000 - (new Date().getTime() - startTime));
                totalTime1.current = currTime / 1000;
            }
        });

        socket.emit("getTimer", {roomID : roomID});
        
        socket.on("timer", (message) => {
            //console.log(onRef.current, on);
            if(onRef.current === on){
                setStartTime(prev => message.start);
                startTime = message.start;
                setCurrTime(totalTime1.current * 1000 - (new Date().getTime() - startTime));
                currTime = (totalTime1.current * 1000 - (new Date().getTime() - startTime));
                
             }
        });
    }, []);
    useEffect(() => {
       // console.log(startTime);
        if(on === onRef.current){ 
            setCurrTime(totalTime1.current * 1000 - (new Date().getTime() - startTime));
            currTime = (totalTime1.current * 1000 - (new Date().getTime() - startTime));
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