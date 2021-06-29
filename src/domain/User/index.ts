import Clock from "../Clock";
import EmailValidator from "../EmailValidator";
import Id from "../Id";
import ValidationError from "../ValidationError";

export default class User {
  constructor(
    private data: {
      id: Id;
      name: string;
      email: string;
      password: string;
      birthDate: Date;
    }
  ) {
    this.trimStrings();
    this.validateData();
  }

  get id() {
    return this.data.id;
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

  private trimStrings() {
    this.data = {
      ...this.data,
      name: this.data.name.trim(),
      email: this.data.email.trim(),
      password: this.data.password.trim(),
    };
  }

  private validateData() {
    this.validateName();
    this.validateEmail();
    this.validateBirthDate();
  }

  private validateName() {
    if (this.data.name.length < 2)
      throw new ValidationError("name must be at least 2 characters long");
  }

  private validateEmail() {
    if (!EmailValidator.validate(this.data.email))
      throw new ValidationError("email must be a valid email");
  }

  private validateBirthDate() {
    const currentUnixTs = Clock.inst.now().getTime();
    const birthDateUnixTs = this.data.birthDate.getTime();
    if (birthDateUnixTs > currentUnixTs)
      throw new ValidationError("birthDate is invalid");
  }
}
