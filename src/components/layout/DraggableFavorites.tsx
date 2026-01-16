import { useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, X } from 'lucide-react'

interface DraggableFavoritesProps {
    favorites: string[]
    onReorder: (newOrder: string[]) => void
    onRemove: (boardId: string) => void
    onSelect: (boardId: string) => void
    currentBoard: string | null
}

interface SortableItemProps {
    id: string
    isActive: boolean
    onSelect: () => void
    onRemove: () => void
}

function SortableItem({ id, isActive, onSelect, onRemove }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDragging
                    ? 'bg-purple-600/30 shadow-lg'
                    : isActive
                        ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                        : 'hover:bg-dark-hover'
                }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-gray-300"
                title="Drag to reorder"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />

            <button
                onClick={onSelect}
                className="flex-1 text-left text-sm font-medium"
            >
                /{id}/
            </button>

            <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                title="Remove from favorites"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default function DraggableFavorites({
    favorites,
    onReorder,
    onRemove,
    onSelect,
    currentBoard,
}: DraggableFavoritesProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = favorites.indexOf(active.id as string)
            const newIndex = favorites.indexOf(over.id as string)
            onReorder(arrayMove(favorites, oldIndex, newIndex))
        }
    }

    if (favorites.length === 0) {
        return (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No favorites yet</p>
                <p className="text-xs mt-1">Click the star on a board to add it</p>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={favorites} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                    {favorites.map(boardId => (
                        <SortableItem
                            key={boardId}
                            id={boardId}
                            isActive={currentBoard === boardId}
                            onSelect={() => onSelect(boardId)}
                            onRemove={() => onRemove(boardId)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}
