/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { QuestionVoicePathResolverService } from "./questionVoicePathResolver.service";

describe("QuestionVoicePathResolverService", () => {
  let service: QuestionVoicePathResolverService;
  let configService: ConfigService;

  const mockCloudFrontUrl = "https://d2ftfzru2cd49g.cloudfront.net/dev/";
  const mockRootQuestionPath = "interview/root-question-voice/";
  const mockNextQuestionPath = "interview/next-question-voice/";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionVoicePathResolverService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              const config = {
                CLOUD_FRONT_DOMAIN_URL: mockCloudFrontUrl,
                ROOT_QUESTION_S3_PATH: mockRootQuestionPath,
                NEXT_QUESTION_S3_PATH: mockNextQuestionPath
              };
              return config[key as keyof typeof config] || defaultValue;
            })
          }
        }
      ]
    }).compile();

    service = module.get<QuestionVoicePathResolverService>(
      QuestionVoicePathResolverService
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("resolveRootQuestionCdnPath", () => {
    it("should generate correct CDN path for root question", () => {
      const rootQuestionId = 123;
      const expectedPath = `${mockCloudFrontUrl}${mockRootQuestionPath}${rootQuestionId}.wav`;

      const result = service.resolveRootQuestionCdnPath(rootQuestionId);

      expect(result).toBe(expectedPath);
    });

    it("should handle different root question IDs", () => {
      const testIds = [1, 999, 12345];

      testIds.forEach((id) => {
        const result = service.resolveRootQuestionCdnPath(id);
        expect(result).toContain(id.toString());
        expect(result).toContain(".wav");
        expect(result).toContain(mockCloudFrontUrl);
      });
    });
  });

  describe("resolveRootQuestionS3Key", () => {
    it("should generate correct S3 key for root question", () => {
      const rootQuestionId = 456;
      const expectedKey = `${mockRootQuestionPath}${rootQuestionId}.wav`;

      const result = service.resolveRootQuestionS3Key(rootQuestionId);

      expect(result).toBe(expectedKey);
      expect(result).not.toContain(mockCloudFrontUrl);
    });
  });

  describe("resolveNextQuestionCdnPath", () => {
    it("should generate correct CDN path for next question", () => {
      const nextQuestionId = 789;
      const expectedPath = `${mockCloudFrontUrl}${mockNextQuestionPath}${nextQuestionId}.wav`;

      const result = service.resolveNextQuestionCdnPath(nextQuestionId);

      expect(result).toBe(expectedPath);
    });

    it("should handle different next question IDs", () => {
      const testIds = [1, 500, 99999];

      testIds.forEach((id) => {
        const result = service.resolveNextQuestionCdnPath(id);
        expect(result).toContain(id.toString());
        expect(result).toContain(".wav");
      });
    });
  });

  describe("resolveNextQuestionS3Key", () => {
    it("should generate correct S3 key for next question", () => {
      const nextQuestionId = 321;
      const expectedKey = `${mockNextQuestionPath}${nextQuestionId}.wav`;

      const result = service.resolveNextQuestionS3Key(nextQuestionId);

      expect(result).toBe(expectedKey);
      expect(result).not.toContain(mockCloudFrontUrl);
    });
  });

  describe("configuration", () => {
    it("should use ConfigService values", () => {
      expect(configService.get).toHaveBeenCalledWith(
        "CLOUD_FRONT_DOMAIN_URL",
        expect.any(String)
      );
      expect(configService.get).toHaveBeenCalledWith(
        "ROOT_QUESTION_S3_PATH",
        expect.any(String)
      );
      expect(configService.get).toHaveBeenCalledWith(
        "NEXT_QUESTION_S3_PATH",
        expect.any(String)
      );
    });
  });

  describe("file extension", () => {
    it("should always append .wav extension", () => {
      const id = 100;

      expect(service.resolveRootQuestionCdnPath(id)).toContain(".wav");
      expect(service.resolveRootQuestionS3Key(id)).toContain(".wav");
      expect(service.resolveNextQuestionCdnPath(id)).toContain(".wav");
      expect(service.resolveNextQuestionS3Key(id)).toContain(".wav");
    });
  });
});
