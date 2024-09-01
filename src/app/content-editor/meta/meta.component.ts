import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../shared/services/post.service';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.css'
})
export class MetaComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private postService: PostService) { }

  form = new FormGroup({
    image: new FormControl('', { validators: [Validators.required, this.urlImageValidator], updateOn: 'blur' }),
    title: new FormControl('', { validators: Validators.required, updateOn: 'blur' })
  }, { updateOn: 'submit' });

  // Form validation
  urlImageValidator(control: FormControl): { [key: string]: any } | null {
    const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\.(?:jpg|jpeg|png|gif|bmp|svg|webp)$/;
    if (!pattern.test(control.value)) {
      return { urlError: 'URL Error' };
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      const title = this.form.get('title')?.value || '';
      const image = this.form.get('image')?.value || '';
      this.postService.createPost(title, image).subscribe({
        next: (response) => {
          this.toEditor(response.postId)
        },
        error: (error) => {
          alert('Error al crear el usuario:' + error);  // Manejo del error
        }
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  toEditor(postId: string) {
    this.router.navigate([`../${postId}`], { relativeTo: this.activatedRoute });
  }
}
