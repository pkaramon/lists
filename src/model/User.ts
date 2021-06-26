import Clock from "./Clock";
import EmailValidator from "./EmailValidator";
import ValidationError from "./ValidationError";

export default class User {
  constructor(
    private data: {
      name: string;
      email: string;
      password: string;
      birthDate: Date;
    }
  ) {
    this.validateData();
  }

  get name() {
    return this.data.name;
  }

  get email() {
    return this.data.email;
  }

  get password() {
    return this.data.password;
  }

  get birthDate() {
    return new Date(this.data.birthDate);
  }

  private validateData() {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateBirthDate();
  }

  private validateName() {
    const name = this.data.name.trim();
    if (name.length < 2) {
      throw new ValidationError("name must be at least 2 characters long");
    }
  }

  private validateEmail() {
    if (!EmailValidator.validate(this.data.email))
      throw new ValidationError("email must be a valid email");
  }

  private validatePassword() {
    const password = this.data.password.trim();
    if (password.length < 8)
      throw new ValidationError("password must contain at least 8 characters");
  }

  private validateBirthDate() {
    const currentUnixTs = Clock.inst.now().getTime();
    const birthDateUnixTs = this.data.birthDate.getTime();
    if (birthDateUnixTs > currentUnixTs)
      throw new ValidationError("birthDate is invalid");
  }
}
