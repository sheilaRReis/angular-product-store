import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductsService } from '../../app/shared/services/products.service';
import { ProductPayload } from '../../app/shared/interfaces/product.payload.interface';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {
  productsService = inject(ProductsService);
  fb = inject(FormBuilder);

  submitting = false;

  form = this.fb.group(
    {
      name: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)]
      }),
      price: this.fb.control<number>(0, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0.01),
          Validators.max(1_000_000),
          Validators.pattern(/^\d+(\.\d{1,2})?$/) // até 2 casas decimais
        ]
      }),
      description: this.fb.control<string | null>(null, {
        validators: [Validators.maxLength(500)]
      })
    },
    { updateOn: 'blur' }
  ) as FormGroup<{
    name: FormControl<string>;
    price: FormControl<number>;
    description: FormControl<string | null>;
  }>;

  get controls() {
    return this.form.controls;
  }

  private buildPayload(): ProductPayload {
    const name = this.controls.name.value.trim();
    const rawPrice = Number(this.controls.price.value);
    const price = Number(rawPrice.toFixed(2));
    const description = this.controls.description.value?.trim() ?? null;
    return { name, price, description };
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    const payload = this.buildPayload();

    this.productsService
      .post(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          this.form.reset({ name: '', price: 0, description: null });
          this.form.markAsPristine();
          this.form.markAsUntouched();
          console.log('Produto criado', res);
        },
        error: (err) => {
          console.error('Erro ao criar produto', err);
        }
      });
  }
}
