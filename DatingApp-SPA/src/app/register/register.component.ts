import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private authService: AuthService, private router: Router,
    private alertify: AlertifyService, private fb: FormBuilder) { }

  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red'
    };
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      // password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
      password: [
        null,
        Validators.compose([
          Validators.required,
          this.patternValidator(/\d/, { hasNumber: true }), // check whether the entered password has a number
          this.patternValidator(/[A-Z]/, { hasCapitalCase: true }), // check whether the entered password has upper case letter
          this.patternValidator(/[a-z]/, { hasSmallCase: true }), // check whether the entered password has a lower case letter
          this.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            { hasSpecialCharacters: true }), // check whether the entered password has a special character
          Validators.minLength(6),
          Validators.maxLength(12)
        ])
      ],
      confirmPassword: ['', Validators.required]
    }, {validator: this.passwordMatchValidator});
  }

  patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

        if (!control.value) {
            // if control is empty return no error
            return null;
        }

        // test the value of the control against the regexp supplied
        const valid = regex.test(control.value);

        // if true, return no error (no error), else return error passed in the second parameter
        return valid ? null : error;
    };
}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {'mismatch': true};
  }

  register() {
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(() => {
        this.alertify.success('Registration successful');
      }, error => {
        this.alertify.error(error);
      }, () => {
        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

}
