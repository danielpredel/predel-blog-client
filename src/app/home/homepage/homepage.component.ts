import { Component } from '@angular/core';
import { BlogEntryComponent } from "../blog-entry/blog-entry.component";
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { PostService } from '../../shared/services/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [BlogEntryComponent, NgFor, NgClass, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  loading: boolean = true;
  error: boolean = false;

  constructor(private postService: PostService, private router: Router) { }
  posts: Array<{ _id: string, title: string, image: string, author: string, authorImage: string }> = [];

  ngOnInit() {
    this.postService.getPosts().subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
      }
    });
  }

  toPost(id: string) {
    this.router.navigate(['/post', id]);
  }
}
