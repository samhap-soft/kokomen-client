import { gql } from "@apollo/client";

type AppleLoginInput = {
  authorizationCode: string;
  identityToken: string;
  realUserStatus: number;
  user: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
    middleName?: string;
    namePrefix?: string;
    nameSuffix?: string;
    nickname?: string;
  };
  nonce?: string;
  state?: string;
};

const CREATE_APPLE_LOGIN_MUTATION = gql`
  mutation appleAuth($input: AppleAuthInput!) {
    appleAuth(input: $input) {
      id
      nickname
      profile_completed
    }
  }
`;

export type { AppleLoginInput };
export { CREATE_APPLE_LOGIN_MUTATION };
