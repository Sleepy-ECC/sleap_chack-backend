export class Email {
  private constructor(public readonly value: string) {}

  static create(rawValue: string): Email {
    return new Email(rawValue.trim().toLowerCase());
  }
}
