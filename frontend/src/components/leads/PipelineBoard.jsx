import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { updateLeadStatus } from "../../utils/leadService";

const columns = ["new", "contacted", "in_progress", "paid", "unpaid", "completed"];

export default function PipelineBoard({ leads, reload }) {
  const grouped = Object.fromEntries(
    columns.map((c) => [c, leads.filter((l) => l.status === c)])
  );

  const onDragEnd = async ({ destination, draggableId }) => {
    if (!destination) return;

    await updateLeadStatus(draggableId, {
      status: destination.droppableId,
      pipelineOrder: Date.now()
    });

    reload();
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-6 gap-4">
        {columns.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(p) => (
              <div ref={p.innerRef} {...p.droppableProps} className="bg-gray-100 rounded-xl p-3">
                <h3 className="font-bold capitalize mb-3">{col}</h3>

                {grouped[col].map((lead, index) => (
                  <Draggable draggableId={lead._id} index={index} key={lead._id}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className="bg-white rounded-lg p-3 mb-3 shadow text-sm"
                      >
                        <div className="font-semibold">{lead.name || lead.phone}</div>
                        <div className="text-gray-500 text-xs">{lead.phone}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
