import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorsService } from '../../shared/services/validators.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-meta',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './meta.component.html',
  styleUrl: './meta.component.css'
})
export class MetaComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private userService: UserService, private validatorService: ValidatorsService) { }

  form = new FormGroup({
    image: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.validatorService.imageUrl()], updateOn: 'blur'
    }),
    title: new FormControl('', { validators: Validators.required, updateOn: 'change' })
  }, { updateOn: 'submit' });

  onSubmit() {
    if (this.form.valid) {
      const title = this.form.get('title')?.value || '';
      const image = this.form.get('image')?.value || '';
      this.userService.createPost(title, image).subscribe({
        next: (response) => {
          this.toEditor(response.postId)
        },
        error: (error) => {
          alert('Error al crear el post:' + error);
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
