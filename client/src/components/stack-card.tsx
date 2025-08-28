import { useState } from "react";
import { GripVertical, Layers, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStacks } from "@/hooks/use-stacks";
import type { Stack } from "@shared/schema";

interface StackCardProps {
  stack: Stack;
  recipeCount: number;
  onClick: (stack: Stack) => void;
  isExpanded?: boolean;
}

export default function StackCard({ stack, recipeCount, onClick, isExpanded }: StackCardProps) {
  console.log('StackCard render:', stack.name, 'recipes:', recipeCount);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stack.name);
  const { updateStack } = useStacks();

  const handleDragClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the stack when dragging
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(stack.name);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateStack.mutate({
      id: stack.id,
      data: {
        name: editName.trim() || stack.name,
        description: stack.description,
        position: stack.position,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(stack.name);
    setIsEditing(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="stack-card bg-red-500 border-2 border-yellow-500"
      onClick={() => !isEditing && onClick(stack)}
      data-testid={`card-stack-${stack.id}`}
      style={{ minHeight: '200px', width: '120px' }}
    >
      <div className="stack-layer bg-blue-300"></div>
      <div className="stack-layer bg-green-300"></div>
      <div className="stack-layer bg-white">
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div 
              className="drag-handle z-10" 
              data-testid={`drag-handle-${stack.id}`}
              onClick={handleDragClick}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <button
              onClick={handleEditClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`button-edit-stack-${stack.id}`}
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onClick={handleInputClick}
                  className="text-lg font-semibold h-7 px-1"
                  data-testid={`input-stack-name-${stack.id}`}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700"
                  data-testid={`button-save-stack-${stack.id}`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`button-cancel-stack-${stack.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3 className="font-semibold text-lg text-black" data-testid={`text-stack-name-${stack.id}`}>
                {stack.name}
              </h3>
            )}
          </div>
          
          <p className="text-gray-600 text-sm flex-1" data-testid={`text-stack-description-${stack.id}`}>
            {stack.description}
          </p>
          
          <div className="mt-auto pt-2">
            {recipeCount === 0 ? (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded" data-testid={`text-empty-stack-${stack.id}`}>
                Empty stack
              </span>
            ) : (
              <span className="text-xs text-gray-500 bg-blue-200 px-2 py-1 rounded" data-testid={`text-recipe-count-${stack.id}`}>
                {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}