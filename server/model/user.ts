export type Right = 'ADMIN' | 'TRAINING' | undefined;

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  rights: Array<Right>;
  lastTokenGeneration?: string;
  token?: string;
  _id?: string;
}
