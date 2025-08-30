import { Component, computed, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../../shared/interfaces/product.interface';


@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;

  productName = computed(() => this.product.name);
  productDescription = computed(() => this.product.description);
  productPrice = computed(() => this.product.price);
  productId = computed(() => this.product.id);

  ngOnInit(): void {
    if (!this.product) {
      throw new Error('CardComponent: required @Input() "product" is missing. Bind a Product in the parent component.');
    }
  }
}
