import { Component, inject, input, output } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from 'src/app/user/user.service';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

export interface AuthorizationEvent {
  token: string
}

@Component({
    selector: 'authorization',
    templateUrl: './authorization.component.html',
    styleUrls: ['./authorization.component.scss'],
    imports: [MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, MatError, MatButton]
})
export class AuthorizationComponent {
  private userService = inject(UserService);

  readonly token = input<string>(undefined);
  readonly compact = input(false);
  readonly authorized = output<AuthorizationEvent>();

  deviceId = new FormControl('', [Validators.required])

  authorize(): void {
    this.deviceId.setErrors(null)
    this.userService.authorize(this.token(), this.deviceId.value).subscribe({
      next: (response) => {
         this.authorized.emit({ token: response.token })
      },
      error: () => {
        this.deviceId.setErrors({ invalid: true})
      }
    })
  }
}
