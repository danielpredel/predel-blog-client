import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogEntryComponent } from './blog-entry/blog-entry.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' }, // redirect to root
  { path: ':id', title: 'Post', component: BlogEntryComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeModule { }
