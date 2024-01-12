import {useDrag, DragPreviewImage} from 'react-dnd'



const Piece = ({pid}) => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "piece",
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [],
  );
  const src = (pid === '-' ? null : pid[0] + pid[1] + pid[2]);
  return (
    <>
      <DragPreviewImage connect={preview} src = {`/src/components/drag-preview.png`} />
      <div
        ref={drag}
        style={{
          height : "100%",
          width : "100%",
          opacity: isDragging ? 0.5 : 1,
          position : "relative"
        }}
      >
        {
          src == null ? 
            <img /> : 
            <img height = "100%" width = "100%" 
            src = {`/src/components/${pid[0]+pid[1]+pid[2]}.png`} />
        }
      </div>
    </>
  );
};

export default Piece;