import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { PostService } from '../../shared/services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TextComponent } from '../text/text.component';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-blog-entry',
  standalone: true,
  imports: [],
  templateUrl: './blog-entry.component.html',
  styleUrl: './blog-entry.component.css'
})
export class BlogEntryComponent {
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  postId: string = '';
  postTitle: string = '';
  postDate: string = '';
  postAuthor: string = '';
  serverError: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private postService: PostService) { }

  ngOnInit() {
    // Get the post id
    this.activatedRoute.paramMap.subscribe(params => {
      this.postId = params.get('id') || '';
      this.postService.getPost(this.postId).subscribe({
        next: (response) => {
          const post = response.post;
          this.postTitle = post.title;
          this.postAuthor = post.author;
          this.postDate = post.creationDate;
          const data = post.body as Array<any>;
          if (data.length > 0) {
            this.setData(data);
          }
        },
        error: (error) => {
          alert(error.message)
          // switch (error.status) {
          //   case 400:
          //     this.toHome();
          //     break;
          //   case 401:
          //     this.sessionEnded = true;
          //     setTimeout(() => {
          //       this.authService.clearSession();
          //       this.toLogin()
          //     }, 5000);
          //     break;
          //   case 404:
          //     this.toHome();
          //     break;
          //   case 500:
          //     this.serverError = true;
          //     break;
          // }
        }
      });

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
        // case 'IMAGE':
        //   this.addImageComponent(index, element.data);
        //   break;
        // case 'CODE-SNIPPET':
        //   this.addCodeSnippetComponent(index, element.data);
        //   break;
      }
    })
  }

  addTextComponent(index: number, data: Array<any> = [], elementType: string = 'PARAGRAPH') {
    const componentRef = this.container.createComponent(TextComponent, { index });

    // Send the init data in case there's any
    setTimeout(() => {
      if (elementType != 'PARAGRAPH') {
        componentRef.instance.setElementType(elementType);
      }
      componentRef.instance.setData(data);
    }, 0);
  }


  addListComponent(index: number, type: string, data: Array<any> = [], renderMode: boolean = false) {
    const componentRef = this.container.createComponent(ListComponent, { index });

    // Send the init data in case there's any
    setTimeout(() => {
      if (type == 'OL') {
        componentRef.instance.changeTypeToOrdered();
      }
      if (data.length > 0) {
        componentRef.instance.setData(data);
      }
    }, 0);
  }


}
