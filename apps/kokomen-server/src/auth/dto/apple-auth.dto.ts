import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max
} from "class-validator";
import { AppleCredentialState } from "../enums/apple-credential-state.enum";

@InputType()
export class AppleFullNameInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  givenName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  familyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  namePrefix?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameSuffix?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nickname?: string;
}

@InputType()
export class AppleAuthInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  authorizationCode: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  identityToken: string;

  @Field()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  realUserStatus: AppleCredentialState;

  @Field()
  @IsOptional()
  @IsString()
  user: string;

  @Field(() => AppleFullNameInput, { nullable: true })
  @IsOptional()
  fullName?: AppleFullNameInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nonce?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  id: number;

  @Field()
  nickname: string;

  @Field()
  profile_completed: boolean;
}

export interface AppleTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  nonce?: string;
  c_hash?: string;
  email?: string;
  email_verified?: boolean;
  auth_time?: number;
  nonce_supported?: boolean;
  real_user_status?: AppleCredentialState;
}
