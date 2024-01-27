import { useDrop } from 'react-dnd'
//import { Overlay, OverlayType } from './Overlay.js'
import Square1  from './Square1.jsx'
import { socket } from './socket';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';




function Square({ black, children, game, x, y }) {
  let [game1, setGame] = useState(game);
  useEffect(() => {
    console.log("aa gaya bhaiya yaha");
    game1 = game; 
    setGame(game1)
  }
  , [game1]);

  
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept : "piece",
      // canDrop: async (item, monitor) => {
      //   // const clientOffset = monitor.getClientOffset();
      //   // console.log('Dropped item:', item);
      //   // console.log('Client offset:', clientOffset);
      //   // return { name: `Square ${x} ${y}` };
      //    return true;
      // },  
      drop: async (item, monitor) => {
        const clientOffset = monitor.getClientOffset();
        const x = clientOffset.x;
        const y = clientOffset.y;
        console.log('Dropped item:', item);
        console.log('Client offset:', clientOffset);
        const username = Cookies.get().username;
        console.log(username, game1.turn, game.playerBlack);
        // if((game.turn === 0 && username === game.playerWhite) || 
        // (game.turn === 1 && username === game.playerBlack)){
          socket.emit("checkMove", {
            from : {x : item.id[3], y : item.id[4]}, 
            to : {x : Math.floor(y / (62.5)), y : Math.floor(x / (62.5))}, 
            username : username, 
            roomID : game.roomID
          });
       // }
       // return { name: `Square ${x} ${y}` };
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [game1],
  )
  return (
    <div
      ref={drop}
      role="Space"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Square1 black = {black} >{children}</Square1>
      {/* {isOver && !canDrop && <Overlay type={OverlayType.IllegalMoveHover} />}
      {!isOver && canDrop && <Overlay type={OverlayType.PossibleMove} />}
      {isOver && canDrop && <Overlay type={OverlayType.LegalMoveHover} />} */}
    </div>
  )
}

export default Square;