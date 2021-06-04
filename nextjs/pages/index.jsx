import { DndContext } from '@dnd-kit/core';
import Draggable from './Draggable';
import Droppable from './Droppable';

const Home = () => {
  return (
    <DndContext>
      <Draggable />
      <Droppable>
        <div style={{ width: 500, height: 500 }}>

        </div>
      </Droppable>
    </DndContext>
  )
}

export default Home;