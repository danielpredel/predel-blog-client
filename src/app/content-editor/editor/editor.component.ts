import { Component, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { StaticIdService } from '../static-id.service';
import { TooltipComponent } from "../tooltip/tooltip.component";
import { TextComponent } from "../text/text.component";
import { ListComponent } from '../list/list.component';
import { ImageComponent } from "../image/image.component";
import { CodeSnippetComponent } from '../code-snippet/code-snippet.component';
import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, TooltipComponent, ListComponent, ImageComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  // DOM Manipulation Varibles
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild(TooltipComponent) tooltip!: TooltipComponent;

  // ComponentRef inside the ViewContainerRef and their Ids
  private components: ComponentRef<any>[] = [];
  private componentsIds: Array<string> = [];
  private lastFocusedComponent: number = 0;

  postId: string = '';
  postTitle: string = '';
  postHidden: boolean = true;
  sessionEnded: boolean = false;
  serverError: boolean = false;
  publishSuccess: boolean = false;

  constructor(private idService: StaticIdService, private authService: AuthService,
    private router: Router, private activatedRoute: ActivatedRoute, private userService: UserService) { }

  ngOnInit() {
    // Get the post id
    this.activatedRoute.paramMap.subscribe(params => {
      this.postId = params.get('id') || '';
      if (this.postId !== 'trial-mode') {
        if (this.isLogged()) {
          this.userService.getPost(this.postId).subscribe({
            next: (response) => {
              if (response.success) {
                const post = response.post;
                this.postTitle = post.title;
                this.postHidden = post.hidden;
                const data = post.body as Array<any>;
                if (data.length > 0) {
                  this.setData(data);
                }
                else {
                  this.renderNewPost();
                }
              }
            },
            error: (error) => {
              switch (error.status) {
                case 400:
                  this.toHome();
                  break;
                case 401:
                  this.sessionEnded = true;
                  setTimeout(() => {
                    this.authService.clearSession();
                    this.toLogin()
                  }, 5000);
                  break;
                case 404:
                  this.toHome();
                  break;
                case 500:
                  this.serverError = true;
                  break;
              }
            }
          });
        }
        else {
          this.toHome();
        }
      }
      else {
        this.postTitle = 'Trial Mode'
        this.renderNewPost();
      }
    });
  }

  // Event Functions
  onMouseUp() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.tooltip.onWindowSelection(selection);
    }
  }

  onMouseDown() {
    this.tooltip.hide();
    this.hideWindowSelection();
  }

  onTooltipSelection(selection: any) {
    let componentId = selection.ancestorId.substring(0, 14);
    let index = this.componentsIds.indexOf(componentId);
    if (index > -1) {
      let componentRef = this.components[index];
      if (componentRef.componentType === TextComponent || componentRef.componentType === ListComponent) {
        componentRef.instance.onTooltipSelection(selection);
      }
    }
  }

  // Setters
  setComponentBefore() {
    this.components.forEach((componentRef, index) => {
      if (componentRef.componentType !== ListComponent) {
        if (index > 0) {
          switch (this.components[index - 1].componentType) {
            case TextComponent:
              this.components[index].instance.setComponentBefore('TEXT');
              break;
            case ListComponent:
              this.components[index].instance.setComponentBefore('LIST');
              break;
            case ImageComponent:
              this.components[index].instance.setComponentBefore('IMAGE');
              break;
            case CodeSnippetComponent:
              this.components[index].instance.setComponentBefore('CODE-SNIPPET');
              break;
          }
        }
        else {
          this.components[index].instance.setComponentBefore('NONE');
        }
      }
    });
  }

  setData(data: Array<any>) {
    data.forEach((element, index) => {
      switch (element.type) {
        case 'TITLE':
          this.addTextComponent(index, element.data, element.type);
          break;
        case 'SUBTITLE':
          this.addTextComponent(index, element.data, element.type);
          break;
        case 'PARAGRAPH':
          this.addTextComponent(index, element.data, element.type);
          break;
        case 'OL':
          this.addListComponent(index, element.type, element.data, true);
          break;
        case 'UL':
          this.addListComponent(index, element.type, element.data, true);
          break;
        case 'IMAGE':
          this.addImageComponent(index, element.data);
          break;
        case 'CODE-SNIPPET':
          this.addCodeSnippetComponent(index, element.data);
          break;
      }
    })
  }

  // Getters
  getMixListOperation(index: number, componentType: string = 'TEXT'): string {
    let type = 'NONE';

    if (componentType == 'UL' || componentType == 'OL' || componentType == 'TEXT') {
      let listAbove = 'NONE';
      let listBelow = 'NONE';
      if (index > 0) {
        if (this.components[index - 1].componentType === ListComponent) {
          listAbove = this.components[index - 1].instance.getListType();
        }
      }
      if (index + 1 < this.components.length) {
        if (this.components[index + 1].componentType === ListComponent) {
          listBelow = this.components[index + 1].instance.getListType();
        }
      }

      let operation = this.getMixListType(listAbove, componentType, listBelow);
      if (operation) {
        return operation;
      }
      else {
        return 'NONE';
      }
    }

    return type;
  }

  getMixListType(listAbove: string, componentType: string, listBelow: string) {
    const clave = listAbove + componentType + listBelow;
    const combinaciones = new Map([
      ['OLOLOL', 'BOTH'],
      ['OLOLUL', 'ABOVE'],
      ['OLOLNONE', 'ABOVE'],
      ['OLULOL', 'NONE'],
      ['OLULUL', 'BELOW'],
      ['OLULNONE', 'NONE'],
      ['OLTEXTOL', 'BOTH'],
      ['OLTEXTUL', 'ABOVE'],
      ['OLTEXTNONE', 'ABOVE'],
      ['ULOLOL', 'BELOW'],
      ['ULOLUL', 'NONE'],
      ['ULOLNONE', 'NONE'],
      ['ULULOL', 'ABOVE'],
      ['ULULUL', 'BOTH'],
      ['ULULNONE', 'ABOVE'],
      ['ULTEXTOL', 'ABOVE'],
      ['ULTEXTUL', 'BOTH'],
      ['ULTEXTNONE', 'ABOVE'],
      ['NONEOLOL', 'BELOW'],
      ['NONEOLUL', 'NONE'],
      ['NONEOLNONE', 'NONE'],
      ['NONEULOL', 'NONE'],
      ['NONEULUL', 'BELOW'],
      ['NONEULNONE', 'NONE'],
      ['NONETEXTOL', 'NONE'],
      ['NONETEXTUL', 'NONE'],
      ['NONETEXTNONE', 'NONE']
    ])
    return combinaciones.get(clave);
  }

  getData() {
    let data = Array();
    this.components.forEach(component => {
      let type = '';
      switch (component.componentType) {
        case TextComponent:
          type = component.instance.getElementType();
          break;
        case ListComponent:
          type = component.instance.getListType();
          break;
        case ImageComponent:
          type = 'IMAGE';
          break;
        case CodeSnippetComponent:
          type = 'CODE-SNIPPET';
          break;
      }
      data.push({ type, data: component.instance.getData() });
    });
    return data;
  }

  // Functions
  hideWindowSelection() {
    window.getSelection()?.removeAllRanges();
  }

  renderNewPost() {
    this.addTextComponent(0, []);
  }

  save(hidden: boolean = this.postHidden) {
    let data = this.getData();
    this.userService.updatePost(this.postId, data, hidden).subscribe({
      next: (response) => {
        this.postHidden = hidden;
        this.publishSuccess = true;
        setTimeout(() => {
          this.publishSuccess = false
        }, 5000);
      },
      error: (error) => {
        switch (error.status) {
          case 400:
            this.toHome();
            break;
          case 401:
            this.sessionEnded = true;
            setTimeout(() => {
              this.authService.clearSession();
              this.toLogin()
            }, 5000);
            break;
          case 404:
            this.toHome();
            break;
          case 500:
            this.serverError = true;
            break;
        }
      }
    });
  }

  isLogged() {
    return this.authService.isLogged();
  }

  toHome() {
    this.router.navigate(['/']);
  }

  toLogin() {
    this.router.navigate(['/user/login']);
  }

  toSignUp() {
    this.router.navigate(['/user/sign-up']);
  }

  // Text Component Functions
  addTextComponent(index: number, data: Array<any> = [], elementType: string = 'PARAGRAPH') {
    const componentRef = this.container.createComponent(TextComponent, { index });

    let id = this.idService.getId();
    let ids = Array();
    ids.push(`txt-${id}`);
    ids.push(`txt-${id}-Title`);
    ids.push(`txt-${id}-Subtitle`);
    ids.push(`txt-${id}-Paragraph`);

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(ids);
      if (elementType != 'PARAGRAPH') {
        componentRef.instance.setElementType(elementType);
      }
      componentRef.instance.setData(data);
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, ids[0]);
    this.subscribeTextComponentEvents(componentRef);
  }

  changeTextComponent(index: number, data: any) {
    let componentType = data.type;
    let operation = this.getMixListOperation(index, componentType);
    if (componentType === 'UL' || componentType === 'OL') {
      const component = this.components.splice(index, 1)[0];
      this.componentsIds.splice(index, 1);
      component.instance.addComponent.unsubscribe();
      component.instance.deleteComponent.unsubscribe();
      component.instance.changeComponent.unsubscribe();
      component.instance.focused.unsubscribe();

      this.container.remove(index);
    }

    switch (componentType) {
      case 'UL':
        switch (operation) {
          case 'NONE':
            this.addListComponent(index, componentType);
            break;
          case 'BOTH':
            this.components[index - 1].instance.addListItem(-1);
            let data = this.removeListComponent(index);
            this.components[index - 1].instance.mixList(data);
            break;
          case 'ABOVE':
            this.components[index - 1].instance.addListItem(-1);
            break;
          case 'BELOW':
            this.components[index].instance.addListItem(0);
            break;
        }
        break;
      case 'OL':
        switch (operation) {
          case 'NONE':
            this.addListComponent(index, componentType);
            break;
          case 'BOTH':
            this.components[index - 1].instance.addListItem(-1);
            let data = this.removeListComponent(index);
            this.components[index - 1].instance.mixList(data);
            break;
          case 'ABOVE':
            this.components[index - 1].instance.addListItem(-1);
            break;
          case 'BELOW':
            this.components[index].instance.addListItem(0);
            break;
        }
        break;
      case 'IMAGE':
        let src = data.src;
        let alt = data.alt;
        this.addImageComponent(index, { src, alt });
        break;
      case 'CODE-SNIPPET':
        this.addCodeSnippetComponent(index);
        break;
    }
  }

  removeTextComponent(index: number, data: Array<any>) {
    let operation = this.getMixListOperation(index);
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.deleteComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.focused.unsubscribe();

    this.container.remove(index);
    setTimeout(() => {
      switch (operation) {
        case 'NONE':
          this.components[index - 1].instance.placeCursorAtEnd();
          this.components[index - 1].instance.setDataAtEnd(data);
          break;
        case 'BOTH':
          let listData = this.removeListComponent(index);
          this.components[index - 1].instance.placeCursorAtEnd();
          this.components[index - 1].instance.setDataAtEnd(data);
          this.components[index - 1].instance.mixList(listData);
          break;
        case 'ABOVE':
          this.components[index - 1].instance.placeCursorAtEnd();
          this.components[index - 1].instance.setDataAtEnd(data);
          break;
      }
    }, 0);
  }

  subscribeTextComponentEvents(componentRef: ComponentRef<TextComponent>) {
    componentRef.instance.addComponent.subscribe((data) => {
      let index = this.components.indexOf(componentRef);
      this.addTextComponent(index + 1, data);
      this.setComponentBefore();
    });

    componentRef.instance.changeComponent.subscribe((data) => {
      let index = this.components.indexOf(componentRef);
      this.changeTextComponent(index, data);
      this.setComponentBefore();
    });

    componentRef.instance.deleteComponent.subscribe((data) => {
      let index = this.components.indexOf(componentRef);
      this.removeTextComponent(index, data);
      this.setComponentBefore();
    });

    componentRef.instance.focused.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      if (this.lastFocusedComponent < this.container.length
        && this.components[this.lastFocusedComponent].componentType === TextComponent) {
        this.components[this.lastFocusedComponent].instance.hideSpeedDial();
      }
      this.lastFocusedComponent = index;
    });

    setTimeout(() => {
      componentRef.instance.focus();
    }, 0);
  }

  // List Component Functions
  addListComponent(index: number, type: string, data: Array<any> = [], renderMode: boolean = false) {
    const componentRef = this.container.createComponent(ListComponent, { index });
    let id = this.idService.getId();
    let listId = `lst-${id}`;
    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(listId);
      if (type == 'OL') {
        componentRef.instance.changeTypeToOrdered();
      }
      if (data.length > 0) {
        componentRef.instance.setData(data, renderMode);
      }
      else {
        componentRef.instance.renderNewList();
      }
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, listId);
    this.subscribeListComponentEvents(componentRef);
  }

  changeListComponent(index: number, content: any) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.splitComponent.unsubscribe();
    component.instance.focused.unsubscribe();

    // Delete the component
    this.container.remove(index);

    if (content) {
      let data = content?.data as Array<any>;
      if (data.length > 0) {
        let textData = data[0];
        let elementType = content?.elementType;
        if (data.length > 1) {
          let listData = data.slice(1);
          let listType = content?.listType;
          this.addTextComponent(index, textData, elementType);
          this.addListComponent(index + 1, listType, listData, true);
        }
        else {
          this.addTextComponent(index, textData, elementType);
        }
      }
    }
    else {
      this.addTextComponent(index);
    }
  }

  splitListComponent(index: number, content: any) {
    if (content) {
      let data = content?.data as Array<any>;
      if (data.length > 0) {
        let textData = data[0];
        let elementType = content?.elementType;
        if (data.length > 1) {
          let listData = data.slice(1);
          let listType = content?.listType;
          this.addTextComponent(index + 1, textData, elementType);
          this.addListComponent(index + 2, listType, listData, true);
        }
        else {
          this.addTextComponent(index + 1, textData, elementType);
        }
      }
    }
    else {
      this.addTextComponent(index + 1);
    }
  }

  subscribeListComponentEvents(componentRef: ComponentRef<ListComponent>) {
    componentRef.instance.addComponent.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      this.addTextComponent(index + 1);
      this.setComponentBefore();
    });

    componentRef.instance.changeComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      this.changeListComponent(index, content);
      this.setComponentBefore();
    });

    componentRef.instance.splitComponent.subscribe((content) => {
      let index = this.components.indexOf(componentRef);
      this.splitListComponent(index, content);
      this.setComponentBefore();
    });

    componentRef.instance.focused.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      if (this.lastFocusedComponent < this.container.length
        && this.components[this.lastFocusedComponent].componentType === TextComponent) {
        this.components[this.lastFocusedComponent].instance.hideSpeedDial();
      }
      this.lastFocusedComponent = index;
    });
  }

  removeListComponent(index: number): Array<Array<any>> {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.addComponent.unsubscribe();
    component.instance.changeComponent.unsubscribe();
    component.instance.splitComponent.unsubscribe();
    component.instance.focused.unsubscribe();

    // Delete the component
    this.container.remove(index);

    let data = component.instance.getData();
    return data;
  }

  // Image Component Functions
  addImageComponent(index: number, data: any) {
    const componentRef = this.container.createComponent(ImageComponent, { index });
    let id = this.idService.getId();
    let imageId = `img-${id}`;

    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(imageId);
      componentRef.instance.setData(data);
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, imageId);
    this.subscribeImageComponentEvents(componentRef);
  }

  changeImageComponent(index: number) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.changeComponent.unsubscribe();

    // Delete the component
    this.container.remove(index);
    this.addTextComponent(index);
  }

  subscribeImageComponentEvents(componentRef: ComponentRef<ImageComponent>) {
    componentRef.instance.changeComponent.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      this.changeImageComponent(index);
      this.setComponentBefore();
    });
  }

  // Code Snippet Component Functions
  addCodeSnippetComponent(index: number, data: any = null) {
    const componentRef = this.container.createComponent(CodeSnippetComponent, { index });
    let id = this.idService.getId();
    let codeSnippetId = `cds-${id}`;
    // Send the init data in case there's any
    setTimeout(() => {
      componentRef.instance.setId(codeSnippetId);
      if (data) {
        componentRef.instance.setData(data);
      }
      else {
        this.components[index + 1].instance.hideSpeedDial();
        componentRef.instance.placeCursorAtEnd();
      }
      componentRef.instance.highlightCode();
    }, 0);

    this.components.splice(index, 0, componentRef);
    this.componentsIds.splice(index, 0, codeSnippetId);
    this.subscribeCodeSnippetComponentEvents(componentRef);
  }

  changeCodeSnippetComponent(index: number) {
    const component = this.components.splice(index, 1)[0];
    this.componentsIds.splice(index, 1);
    component.instance.changeComponent.unsubscribe();
    component.instance.focused.unsubscribe();

    // Delete the component
    this.container.remove(index);

    this.addTextComponent(index);
  }

  subscribeCodeSnippetComponentEvents(componentRef: ComponentRef<CodeSnippetComponent>) {
    componentRef.instance.changeComponent.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      this.changeCodeSnippetComponent(index);
      this.setComponentBefore();
    });

    componentRef.instance.focused.subscribe(() => {
      let index = this.components.indexOf(componentRef);
      if (this.lastFocusedComponent < this.container.length
        && this.components[this.lastFocusedComponent].componentType === TextComponent) {
        this.components[this.lastFocusedComponent].instance.hideSpeedDial();
      }
      this.lastFocusedComponent = index;
    });
  }
}
