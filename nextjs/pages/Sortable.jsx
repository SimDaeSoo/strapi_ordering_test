import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    closestCenter,
    DragOverlay,
    DndContext,
    defaultDropAnimation,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { createRange } from '../utilities';
import { Item, List, Wrapper } from '../components';

const defaultDropAnimationConfig = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
};

const screenReaderInstructions = {
    draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export function Sortable({
    activationConstraint,
    animateLayoutChanges,
    adjustScale = false,
    Container = List,
    collisionDetection = closestCenter,
    dropAnimation = defaultDropAnimationConfig,
    getItemStyles = () => ({ border: '1px solid black' }),
    handle = false,
    itemCount = 16,
    items: initialItems,
    isDisabled = () => false,
    layoutMeasuring,
    modifiers,
    removable,
    renderItem,
    strategy = rectSortingStrategy,
    useDragOverlay = true,
    wrapperStyle = () => ({})
}) {
    const [items, setItems] = useState(
        () =>
            initialItems ??
            createRange(itemCount, (index) => (index + 1).toString())
    );
    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint }),
        useSensor(TouchSensor, { activationConstraint }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const getIndex = items.indexOf.bind(items);
    const getPosition = (id) => getIndex(id) + 1;
    const activeIndex = activeId ? getIndex(activeId) : -1;
    const handleRemove = removable
        ? (id) => setItems((items) => items.filter((item) => item !== id))
        : undefined;
    const announcements = {
        onDragStart(id) {
            return `Picked up sortable item ${id}. Sortable item ${id} is in position ${getPosition(
                id
            )} of ${items.length}`;
        },
        onDragOver(id, overId) {
            if (overId) {
                return `Sortable item ${id} was moved into position ${getPosition(
                    overId
                )} of ${items.length}`;
            }

            return;
        },
        onDragEnd(id, overId) {
            if (overId) {
                return `Sortable item ${id} was dropped at position ${getPosition(
                    overId
                )} of ${items.length}`;
            }

            return;
        },
        onDragCancel(id) {
            return `Sorting was cancelled. Sortable item ${id} was dropped.`;
        },
    };

    return (
        <DndContext
            announcements={announcements}
            screenReaderInstructions={screenReaderInstructions}
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={({ active }) => {
                if (!active) return;
                setActiveId(active.id);
            }}
            onDragEnd={({ over }) => {
                setActiveId(null);

                if (over) {
                    const overIndex = getIndex(over.id);
                    if (activeIndex !== overIndex) {
                        setItems((items) => arrayMove(items, activeIndex, overIndex));
                    }
                }
            }}
            onDragCancel={() => setActiveId(null)}
            layoutMeasuring={layoutMeasuring}
            modifiers={modifiers}
        >
            <Wrapper center>
                <SortableContext items={items} strategy={strategy}>
                    <Container>
                        {items.map((value, index) => (
                            <SortableItem
                                key={value}
                                id={value}
                                handle={handle}
                                index={index}
                                style={getItemStyles}
                                wrapperStyle={wrapperStyle}
                                disabled={isDisabled(value)}
                                renderItem={renderItem}
                                onRemove={handleRemove}
                                animateLayoutChanges={animateLayoutChanges}
                                useDragOverlay={useDragOverlay}
                            />
                        ))}
                    </Container>
                </SortableContext>
            </Wrapper>
            {/* {useDragOverlay
                ? createPortal(
                    <DragOverlay
                        adjustScale={adjustScale}
                        dropAnimation={dropAnimation}
                    >
                        {activeId ? (
                            <Item
                                value={items[activeIndex]}
                                handle={handle}
                                renderItem={renderItem}
                                wrapperStyle={wrapperStyle({ index: activeIndex, isDragging: true, id: items[activeIndex] })}
                                style={getItemStyles({ id: items[activeIndex], index: activeIndex, isSorting: activeId !== null, isDragging: true, overIndex: -1, isDragOverlay: true })}
                                dragOverlay
                            />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )
                : null} */}
        </DndContext>
    );
}

export function SortableItem({ disabled, animateLayoutChanges, id, index, handle, onRemove, style, renderItem, useDragOverlay, wrapperStyle }) {
    const { attributes, isDragging, isSorting, listeners, overIndex, setNodeRef, transform, transition } = useSortable({ animateLayoutChanges, id, disabled });

    return (
        <Item
            ref={setNodeRef}
            value={id}
            disabled={disabled}
            dragging={isDragging}
            sorting={isSorting}
            handle={handle}
            renderItem={renderItem}
            index={index}
            style={style({ index, id, isDragging, isSorting, overIndex })}
            onRemove={onRemove ? () => onRemove(id) : undefined}
            transform={transform}
            transition={!useDragOverlay && isDragging ? 'none' : transition}
            wrapperStyle={wrapperStyle({ index, isDragging, id })}
            listeners={listeners}
            data-index={index}
            data-id={id}
            dragOverlay={!useDragOverlay && isDragging}
            {...attributes}
        />
    );
}
