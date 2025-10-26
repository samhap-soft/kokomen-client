import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class QuestionVoicePathResolverService {
  private static readonly AUDIO_FILE_EXTENSION = ".wav";

  private readonly cloudFrontDomainUrl: string;
  private readonly rootQuestionS3Path: string;
  private readonly nextQuestionS3Path: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudFrontDomainUrl = this.configService.get<string>(
      "CLOUD_FRONT_DOMAIN_URL",
      "https://d2ftfzru2cd49g.cloudfront.net/dev/"
    );
    this.rootQuestionS3Path = this.configService.get<string>(
      "ROOT_QUESTION_S3_PATH",
      "interview/root-question-voice/"
    );
    this.nextQuestionS3Path = this.configService.get<string>(
      "NEXT_QUESTION_S3_PATH",
      "interview/next-question-voice/"
    );
  }

  resolveRootQuestionCdnPath(rootQuestionId: number): string {
    return (
      this.cloudFrontDomainUrl +
      this.rootQuestionS3Path +
      rootQuestionId +
      QuestionVoicePathResolverService.AUDIO_FILE_EXTENSION
    );
  }

  resolveRootQuestionS3Key(rootQuestionId: number): string {
    return (
      this.rootQuestionS3Path +
      rootQuestionId +
      QuestionVoicePathResolverService.AUDIO_FILE_EXTENSION
    );
  }

  resolveNextQuestionCdnPath(nextQuestionId: number): string {
    return (
      this.cloudFrontDomainUrl +
      this.nextQuestionS3Path +
      nextQuestionId +
      QuestionVoicePathResolverService.AUDIO_FILE_EXTENSION
    );
  }

  resolveNextQuestionS3Key(nextQuestionId: number): string {
    return (
      this.nextQuestionS3Path +
      nextQuestionId +
      QuestionVoicePathResolverService.AUDIO_FILE_EXTENSION
    );
  }
}
