import { useDrop } from 'react-dnd'
//import { Overlay, OverlayType } from './Overlay.js'
import Square1  from './Square1.jsx'
import { socket } from './socket';

function Square({ black, children, game, x, y }) {
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
        console.log('Dropped item:', item);
        console.log('Client offset:', clientOffset);
        console.log("yoo");
        socket.emit("checkMove", {from : item.id, to : {x : x, y : y}, roomID : game.roomID});
        return { name: `Square ${x} ${y}` };
      },
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [game],
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