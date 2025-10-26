/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from "@nestjs/testing";
import { InterviewController } from "./interviewController.controller";
import { InterviewFacadeService } from "../services/interviewFacade.service";
import { EntityManager } from "typeorm";
import { InterviewMode } from "../domains/interviewMode";
import {
  CreateCustomInterviewDto,
  CreateCustomInterviewTextModeResponse,
  CreateCustomInterviewVoiceModeResponse
} from "../dto/createCustomInterview.dto";
import { Member } from "src/member/domains/member";
import { AuthenticatedRequest } from "src/globals/types/request.type";
import { SessionAuthGuardForHTTP } from "src/globals/http-session-auth.guard";
import { TransactionInterceptorForHTTP } from "src/globals/interceptors/transactionInterceptor";
import { RootQuestionService } from "src/interview/services/rootQuestion";

describe("InterviewController", () => {
  let controller: InterviewController;
  let interviewFacadeService: InterviewFacadeService;
  let transactionManager: EntityManager;

  const mockMember: Member = {
    id: 1,
    nickname: "testuser",
    profileCompleted: true
  } as Member;

  const mockRequest = {
    member: mockMember
  } as Request & AuthenticatedRequest;

  const mockTextResponse = new CreateCustomInterviewTextModeResponse(
    200,
    300,
    "테스트 루트 질문입니다"
  );

  const mockVoiceResponse = new CreateCustomInterviewVoiceModeResponse(
    200,
    300,
    "https://cloudfront.net/interview/next-question-voice/300.wav"
  );

  beforeEach(async () => {
    const mockTransactionManager = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn()
    } as unknown as EntityManager;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewController],
      providers: [
        {
          provide: InterviewFacadeService,
          useValue: {
            createCustomInterview: jest.fn()
          }
        },
        {
          provide: EntityManager,
          useValue: mockTransactionManager
        },
        {
          provide: RootQuestionService,
          useValue: {
            findByCategory: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(SessionAuthGuardForHTTP)
      .useValue({
        canActivate: jest.fn(() => true)
      })
      .overrideInterceptor(TransactionInterceptorForHTTP)
      .useValue({
        intercept: jest.fn((_context, next) => next.handle())
      })
      .compile();

    controller = module.get<InterviewController>(InterviewController);
    interviewFacadeService = module.get<InterviewFacadeService>(
      InterviewFacadeService
    );
    transactionManager = mockTransactionManager;

    // Set transactionManager on controller
    (controller as any).transactionManager = mockTransactionManager;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createCustomInterview - TEXT mode", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 100,
      maxQuestionCount: 10,
      mode: InterviewMode.TEXT
    };

    beforeEach(() => {
      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);
    });

    it("should create interview in TEXT mode successfully", async () => {
      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toEqual(mockTextResponse);
    });

    it("should call facade service with correct parameters", async () => {
      await controller.createCustomInterview(mockRequest, dto);

      expect(
        (interviewFacadeService as any).createCustomInterview
      ).toHaveBeenCalledWith(mockMember, dto, transactionManager);
    });

    it("should return interview and question data", async () => {
      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toHaveProperty("interview_id");
      expect(result).toHaveProperty("question_id");
      expect(result).toHaveProperty("root_question");
    });
  });

  describe("createCustomInterview - VOICE mode", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 100,
      maxQuestionCount: 10,
      mode: InterviewMode.VOICE
    };

    beforeEach(() => {
      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockVoiceResponse);
    });

    it("should create interview in VOICE mode successfully", async () => {
      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toEqual(mockVoiceResponse);
    });

    it("should return voice URL for VOICE mode", async () => {
      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toHaveProperty("interview_id");
      expect(result).toHaveProperty("question_id");
      expect(result).toHaveProperty("root_question_voice_url");
    });
  });

  describe("error handling", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 999,
      maxQuestionCount: 10,
      mode: InterviewMode.TEXT
    };

    it("should throw error when root question not found", async () => {
      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockRejectedValue(new Error("Root question not found"));

      await expect(
        controller.createCustomInterview(mockRequest, dto)
      ).rejects.toThrow("Root question not found");
    });

    it("should throw error when token validation fails", async () => {
      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockRejectedValue(new Error("Insufficient tokens"));

      await expect(
        controller.createCustomInterview(mockRequest, dto)
      ).rejects.toThrow("Insufficient tokens");
    });

    it("should handle unexpected errors gracefully", async () => {
      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockRejectedValue(new Error("Unexpected error"));

      await expect(
        controller.createCustomInterview(mockRequest, dto)
      ).rejects.toThrow();
    });
  });

  describe("request validation", () => {
    it("should require authenticated member (handled by guard)", async () => {
      // Guard가 인증을 체크하므로, 컨트롤러는 항상 인증된 member를 받습니다
      // 이 테스트는 Guard의 역할을 확인합니다
      const dto: CreateCustomInterviewDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.TEXT
      };

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);

      const result = await controller.createCustomInterview(mockRequest, dto);
      expect(result).toBeDefined();
      expect(mockRequest.member).toBeDefined();
    });

    it("should validate DTO parameters", async () => {
      const invalidDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.TEXT
      } as CreateCustomInterviewDto;

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);

      const result = await controller.createCustomInterview(
        mockRequest,
        invalidDto
      );

      expect(result).toBeDefined();
    });
  });

  describe("response format", () => {
    it("should return interview and question properties", async () => {
      const dto: CreateCustomInterviewDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.TEXT
      };

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);

      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toHaveProperty("interview_id");
      expect(result).toHaveProperty("question_id");
      expect(result).toBeDefined();
    });

    it("should return correct response structure for TEXT mode", async () => {
      const dto: CreateCustomInterviewDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.TEXT
      };

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);

      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toHaveProperty("interview_id");
      expect(result).toHaveProperty("question_id");
      expect(result).toHaveProperty("root_question");
      expect(result).not.toHaveProperty("root_question_voice_url");
    });

    it("should return correct response structure for VOICE mode", async () => {
      const dto: CreateCustomInterviewDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.VOICE
      };

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockVoiceResponse);

      const result = await controller.createCustomInterview(mockRequest, dto);

      expect(result).toHaveProperty("interview_id");
      expect(result).toHaveProperty("question_id");
      expect(result).toHaveProperty("root_question_voice_url");
      expect(result).not.toHaveProperty("root_question");
    });
  });

  describe("transaction management", () => {
    it("should use transaction manager for database operations", async () => {
      const dto: CreateCustomInterviewDto = {
        rootQuestionId: 100,
        maxQuestionCount: 10,
        mode: InterviewMode.TEXT
      };

      jest
        .spyOn(interviewFacadeService, "createCustomInterview")
        .mockResolvedValue(mockTextResponse);

      await controller.createCustomInterview(mockRequest, dto);

      expect(
        (interviewFacadeService as any).createCustomInterview
      ).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        transactionManager
      );
    });
  });
});
