import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../app/shared/services/products.service';
import { ProductPayload } from '../../app/shared/interfaces/product.payload.interface';
import { of, Observable, firstValueFrom, timer } from 'rxjs';
import { switchMap, map, catchError, take, finalize, filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, NgIf],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {
  productsService = inject(ProductsService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  submitting = false;

  form = this.fb.group(
    {
      name: this.fb.control<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
        asyncValidators: [this.uniqueNameValidator()]
      }),
      price: this.fb.control<number>(0, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0.01),
          Validators.max(1_000_000),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
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

  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  get controls() {
    return this.form.controls;
  }

  private uniqueNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const raw = control.value;
      const name = String(raw ?? '').trim();
      if (!name) {
        return of(null);
      }

      return timer(300).pipe(
        switchMap(() => this.productsService.checkNameUnique(name)),
        map(exists => (exists ? { nameTaken: true } : null)),
        catchError(() => of(null)),
        take(1)
      );
    };
  }

  private buildPayload(): ProductPayload {
    const name = this.controls.name.value.trim();
    const rawPrice = Number(this.controls.price.value);
    const price = Number(rawPrice.toFixed(2));
    const description = this.controls.description.value?.trim() ?? null;
    return { name, price, description };
  }

  private async waitForAsyncValidators(): Promise<void> {
    if (!this.form.pending) return;
    await firstValueFrom(this.form.statusChanges.pipe(filter(s => s !== 'PENDING'), take(1)));
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopImmediatePropagation();

    this.controls.name.updateValueAndValidity({ onlySelf: true, emitEvent: true });

    await this.waitForAsyncValidators();

    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    const payload = this.buildPayload();

    this.productsService
      .post(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          const resetValue = { name: '', price: 0, description: null };

          if (this.formDirective) {
            this.formDirective.resetForm(resetValue);
          } else {
            this.form.reset(resetValue);
            this.form.markAsPristine();
            this.form.markAsUntouched();
          }

          this.snackBar.open('Product created successfully', 'Close');
        },
        error: (err) => {
          console.error('Failed to create product.', err);
          this.snackBar.open('Failed to create product. Please try again.', 'Close');
        }
      });
  }
}
