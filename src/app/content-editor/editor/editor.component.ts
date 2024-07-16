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
    this.addComponent('P');
  }

  addComponent(type: string) {
    const componentRef = this.container.createComponent(ParagraphComponent);
    this.components.push(componentRef);

    const componentIndex = this.components.indexOf(componentRef);
    componentRef.instance.newComponent.subscribe(() => {
      this.addComponentAtIndex(componentIndex + 1, 'P');
    });
    componentRef.instance.deleteMe.subscribe(() => {
      this.removeComponentAtIndex(componentIndex);
    });
    setTimeout(() => {
      this.components[componentIndex].instance.blur();
      componentRef.instance.focus()
    }, 0);
  }

  addComponentAtIndex(index: number, type: string) {
    const componentRef = this.container.createComponent(ParagraphComponent, { index });
    this.components.splice(index, 0, componentRef);

    componentRef.instance.newComponent.subscribe(() => {
      const componentIndex = this.components.indexOf(componentRef);
      this.addComponentAtIndex(componentIndex + 1, 'P');
    });
    componentRef.instance.deleteMe.subscribe(() => {
      const componentIndex = this.components.indexOf(componentRef);
      this.removeComponentAtIndex(componentIndex);
    });

    setTimeout(() => {
      this.components[index - 1].instance.blur();
      componentRef.instance.focus()
    }, 0);
  }

  removeComponentAtIndex(index: number) {
    if (index > 0) {
      const component = this.components.splice(index, 1)[0];
      component.instance.deleteMe.unsubscribe();
      component.instance.newComponent.unsubscribe();
      this.container.remove(index);
      setTimeout(() => {
        this.components[index - 1].instance.focus()
        this.components[index - 1].instance.placeCursorAtEnd()
      }, 0);
    }
  }
}
