import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DragDropProviderProps {
  children: React.ReactNode;
  items: Array<{ id: string }>;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  strategy?: any;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  items,
  onDragEnd,
  onDragStart,
  strategy = verticalListSortingStrategy,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext items={items.map(item => item.id)} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

interface SortableItemProps {
  id: string;
  children: React.ReactNode | ((dragHandleProps: any) => React.ReactNode);
  disabled?: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style}>
      {typeof children === 'function' ? children(dragHandleProps) : children}
    </div>
  );
};

interface DroppableAreaProps {
  children: React.ReactNode;
  id: string;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({
  children,
  id,
}) => {
  return <div data-droppable-id={id}>{children}</div>;
};

// Utility function to handle array reordering
export const reorderArray = <T,>(
  array: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  return arrayMove(array, startIndex, endIndex);
};

// Hook for handling drag and drop
export const useDragDrop = <T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void
) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = reorderArray(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    }
  };

  return { handleDragEnd };
};
