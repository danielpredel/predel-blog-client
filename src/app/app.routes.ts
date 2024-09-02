import { Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'editor', loadChildren: () => import('./content-editor/content-editor.module').then(m => m.ContentEditorModule) },
    { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) }
];
