import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ProductPayload } from '../interfaces/product.payload.interface';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  httpClient = inject(HttpClient);

  getAll(){
     return this.httpClient.get<Product[]>('/api/products');
  }
  post(productPayload: ProductPayload){
    return this.httpClient.post<Product>('/api/products', productPayload);
  }
}
