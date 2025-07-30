// auth.errors.ts
import { CredentialsSignin } from "next-auth";

// Define custom errors in a separate file to avoid circular dependencies
export class InvalidLoginError extends CredentialsSignin {
  code = "invalid_credentials";
  constructor(message: string) {
    super(message);
    this.code = message;
  }
} 