import { Component, inject, input, output } from '@angular/core'
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Api, AuthenticationStrategy } from '../../../api/api.entity'
import { UserService } from '../../../user/user.service'
import { LinkGenerator } from '../../../contact/utilities/link-generator'
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AuthenticationButtonComponent } from '../button/authentication-button.component';

@Component({
    selector: 'ldap-authentication',
    templateUrl: './ldap-authentication.component.html',
    styleUrls: ['./ldap-authentication.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, AuthenticationButtonComponent]
})
export class LdapAuthenticationComponent {
  private userService = inject(UserService);

  readonly api = input<Api>(undefined);
  readonly strategy = input<AuthenticationStrategy>(undefined);

  readonly authenticated = output<any>();
  
  authenticationForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })
  
  contact: string

  error: {
    title: string,
    message: string
  }

  onSignin(): void {
    if (this.authenticationForm.invalid) {
      return
    }

    const { username, password } = this.authenticationForm.value
    this.userService.ldapSignin(username, password).subscribe({
      next: (response: any) => {
        this.authenticated.emit(response)
      },
      error: (response: any) => {
        this.error = {
          title: 'Error Signing In',
          message: response.error || 'Please check your username and password and try again.'
        }

        const api = this.api();
        const email = LinkGenerator.emailLink(api?.contactInfo, response.error, username, this.strategy())
        const phone = LinkGenerator.phoneLink(api?.contactInfo)
        this.contact = `Should you need futher assistance you may contact your Mage administrator via ${[`<a href=${email}>email</a>`, `<a href=${phone}>phone</a>`].join(' or ')}.`
      }
    }) 
  }
}
