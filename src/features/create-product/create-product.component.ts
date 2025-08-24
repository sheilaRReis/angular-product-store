import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators,  } from '@angular/forms';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { MatInputModule  } from '@angular/material/input';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss'
})
export class CreateProductComponent {
  form = new FormGroup({
    name: new FormControl<string>('',{
      nonNullable: true,
      validators: [Validators.required]
    }),
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.form.controls.name.value;
    }
  }
}
