import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component';
import { RouterModule, Routes } from '@angular/router';
import { MetaComponent } from './meta/meta.component';


const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' }, // redirect to root 
  { path: 'new', title: 'New Post', component: MetaComponent },
  { path: ':id', title: 'Editor', component: EditorComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ContentEditorModule { }
