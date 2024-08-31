import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  url = environment.baseUrl + '/posts'

  constructor(private http: HttpClient) { }

  createPost(title: string, image: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new HttpParams()
      .set('title', title)
      .set('image', image);
    return this.http.post<any>(this.url, body, { headers });
  }
}
