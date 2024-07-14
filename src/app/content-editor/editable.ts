import { ElementRef, EventEmitter } from "@angular/core";

export interface Editable {
    enterPressed: EventEmitter<any>;
    backspacePressed: EventEmitter<any>;
    editableElement: ElementRef | undefined;
    cursorElement: ElementRef<any> | undefined;
    onKeyDown(event: KeyboardEvent): void;
    focus(): void;
    placeCursorAtEnd(): void;
}
