import type { AccountlessApplicationJSON } from './JSON';

export class AccountlessApplication {
  constructor(
    readonly publishableKey: string,
    readonly secretKey: string,
    readonly claimToken: string,
  ) {}

  static fromJSON(data: AccountlessApplicationJSON): AccountlessApplication {
    return new AccountlessApplication(data.publishable_key, data.secret_key, data.claim_token);
  }
}