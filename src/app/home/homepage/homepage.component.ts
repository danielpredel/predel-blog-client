import { Component } from '@angular/core';
import { BlogEntryComponent } from "../blog-entry/blog-entry.component";
import { CommonModule, NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [BlogEntryComponent, NgFor, NgClass, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  posts = [
    {
      title: 'Mastering Agile Development: Key Strategies for Software Teams',
      image: 'https://i0.wp.com/www.sweetlightphotos.com/wp-content/uploads/2022/08/2022-08-08_Maara-21333-Edit-1.jpg?fit=800%2C533&ssl=1',
      author: 'Daniel Preciado Delgadillo',
      authorsImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcxmedi0MLNq1BsoLtiW1l89W1OqDMSRjlE-b62SLZ_PEDOwxYc-F9el7rx08VmmWT6Ws&usqp=CAU'
    },
    {
      title: 'Understanding Microservices: A Beginner\'s Guide to Scalable Architecture',
      image: 'https://i.natgeofe.com/n/2a832501-483e-422f-985c-0e93757b7d84/6.jpg?w=1436&h=1078',
      author: 'John Doe',
      authorsImage: 'https://cdn.pixabay.com/photo/2016/01/03/11/24/gear-1119298_1280.png'
    },
    {
      title: 'Top 10 Essential Tools Every Developer Should Know in 2024',
      image: 'https://img.artpal.com/565372/14-23-4-8-13-3-53m.jpg',
      author: 'Jane Doe',
      authorsImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXrFL83_LnT2AR8_1v4rGNgTsntXuaied88g&s'
    },
    {
      title: 'The Future of DevOps: Trends and Best Practices',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdGagNnhzKI9hoJDmtWyHFlrn-9179AK5rIg&s',
      author: 'Red John',
      authorsImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcxmedi0MLNq1BsoLtiW1l89W1OqDMSRjlE-b62SLZ_PEDOwxYc-F9el7rx08VmmWT6Ws&usqp=CAU'
    },
    {
      title: 'Building Secure Applications: A Guide to Modern Cybersecurity Practices',
      image: 'https://m.media-amazon.com/images/I/A1E8gi50o2L._AC_UF894,1000_QL80_.jpg',
      author: 'Patrick Jane',
      authorsImage: 'https://cdn.pixabay.com/photo/2016/01/03/11/24/gear-1119298_1280.png'
    }
  ]

  onClick(index: number) {
    alert(index);
  }
}
