import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ProductPayload } from '../interfaces/product.payload.interface';
import { Product } from '../interfaces/product.interface';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Product[]> {
     return this.http.get<Product[]>('/api/products');
  }

  post(productPayload: ProductPayload): Observable<Product> {
    return this.http.post<Product>('/api/products', productPayload);
  }

  checkNameUnique(name: string): Observable<boolean> {
    const searchUrl = `/api/products?name=${encodeURIComponent(name)}`;
    return this.http.get<Product[]>(searchUrl).pipe(
      map(list => Array.isArray(list) && list.length > 0),
      catchError(err => {
        console.error('checkNameUnique error:', err);
        return of(false);
      })
    );
  }
}
