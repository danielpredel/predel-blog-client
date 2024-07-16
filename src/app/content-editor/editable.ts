import { ElementRef, EventEmitter } from "@angular/core";

export interface Editable {
    newComponent: EventEmitter<any>;
    deleteMe: EventEmitter<any>;
    editableElement: ElementRef | undefined;
    cursorElement: ElementRef<any> | undefined;
    onKeyDown(event: KeyboardEvent): void;
    focus(): void;
    placeCursorAtEnd(): void;
}
