import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ParagraphComponent } from '../paragraph/paragraph.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  private components: ComponentRef<any>[] = [];

  ngOnInit() {
    // this.addParagraph();  // Agrega un párrafo inicial
    this.addComponent();
  }

  addComponent() {
    const componentRef = this.container.createComponent(ParagraphComponent);
    this.components.push(componentRef);
    const index = this.components.indexOf(componentRef);
    componentRef.instance.enterPressed.subscribe((event) => {
      // console.log(`Component at index ${index} emitted an enter event`);
      this.addComponentAtIndex(index + 1);
    });
    componentRef.instance.backspacePressed.subscribe((event) => {
      // console.log(`Component at index ${index} emitted a backspace event`);
      this.removeComponentAtIndex(index);
    });
    setTimeout(() => componentRef.instance.focus(), 0);
  }

  addComponentAtIndex(index: number) {
    const componentRef = this.container.createComponent(ParagraphComponent);
    this.container.insert(componentRef.hostView, index);
    this.components.splice(index, 0, componentRef);
    componentRef.instance.enterPressed.subscribe((event) => {
      const componentIndex = this.components.indexOf(componentRef);
      // console.log(`Component at index ${componentIndex} emitted an enter event`);
      this.addComponentAtIndex(componentIndex + 1);
    });
    componentRef.instance.backspacePressed.subscribe((event) => {
      const componentIndex = this.components.indexOf(componentRef);
      // console.log(`Component at index ${componentIndex} emitted a backspace event`);
      this.removeComponentAtIndex(componentIndex);
    });
    setTimeout(() => componentRef.instance.focus(), 0);
  }

  removeComponentAtIndex(index: number) {
    if (index > 0) {
      const component = this.components.splice(index, 1)[0];
      component.instance.backspacePressed.unsubscribe();
      component.instance.enterPressed.unsubscribe();
      this.container.remove(index);
      setTimeout(() => this.components[index - 1].instance.focus(), 0);
      setTimeout(() => this.components[index - 1].instance.placeCursorAtEnd(), 0);
    }
  }
}
