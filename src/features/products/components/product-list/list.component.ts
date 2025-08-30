import { Component, inject } from '@angular/core';
import { ProductApiService } from '../../../../shared/services/products.api.service';
import { Product } from '../../../../shared/interfaces/product.interface';
import { ProductCardComponent } from "../product-card/product-card.component";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink, MatButtonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  productsService = inject(ProductApiService);
  products: Product[] = [];
  ngOnInit() {
    this.productsService.getAll().subscribe((products) => {
      this.products = products;
    });
  }
}
