import { useDrop } from 'react-dnd'
//import { Overlay, OverlayType } from './Overlay.js'
import Square1  from './Square1.jsx'


function Square({ black, children, game }) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept : "piece",
      canDrop: () => game.canMove(x, y),
      drop: () => game.playMove(x, y),
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