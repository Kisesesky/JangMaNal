import { SocialProvider } from './social-provider.type';

export type OAuthProfile = {
  provider: SocialProvider;
  providerUserId: string;
  email: string;
  name: string;
  profileImageUrl?: string;
};
