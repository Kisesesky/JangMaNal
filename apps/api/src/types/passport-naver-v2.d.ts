declare module 'passport-naver-v2' {
  import { Strategy as OAuth2Strategy } from 'passport-oauth2';

  export interface NaverStrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  }

  export class Strategy extends OAuth2Strategy {
    constructor(
      options: NaverStrategyOptions,
      verify: (...args: unknown[]) => void,
    );
  }
}
