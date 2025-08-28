import { GripVertical, Layers } from "lucide-react";
import type { Stack } from "@shared/schema";

interface StackCardProps {
  stack: Stack;
  recipeCount: number;
  onClick: (stack: Stack) => void;
  isExpanded?: boolean;
}

export default function StackCard({ stack, recipeCount, onClick, isExpanded }: StackCardProps) {
  return (
    <div
      className="stack-card"
      onClick={() => onClick(stack)}
      data-testid={`card-stack-${stack.id}`}
    >
      <div className="stack-layer"></div>
      <div className="stack-layer"></div>
      <div className="stack-layer">
        <div className="p-4 h-full flex flex-col">
          <div className="drag-handle z-10" data-testid={`drag-handle-${stack.id}`}>
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-lg" data-testid={`text-stack-name-${stack.id}`}>
              {stack.name}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm flex-1" data-testid={`text-stack-description-${stack.id}`}>
            {stack.description}
          </p>
          <div className="mt-auto pt-2">
            <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded" data-testid={`text-recipe-count-${stack.id}`}>
              {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
