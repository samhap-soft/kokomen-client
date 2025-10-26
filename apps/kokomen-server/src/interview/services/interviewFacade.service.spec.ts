/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { InterviewFacadeService } from "./interviewFacade.service";
import { InterviewService } from "./interview.service";
import { QuestionService } from "./question.service";
import { RootQuestionService } from "./rootQuestion";
import { TokenService } from "src/token/services/token.service";
import { QuestionVoicePathResolverService } from "./questionVoicePathResolver.service";
import { InterviewMode } from "../domains/interviewMode";
import { InterviewState } from "../domains/interviewState";
import { EntityManager } from "typeorm";
import { Member } from "src/member/domains/member";
import { QuestionState, RootQuestion } from "../domains/rootQuestion";
import { Interview } from "../domains/interview";
import { Question } from "../domains/question";
import {
  CreateCustomInterviewDto,
  CreateCustomInterviewTextModeResponse,
  CreateCustomInterviewVoiceModeResponse
} from "../dto/createCustomInterview.dto";
import { CategoryType } from "src/interview/domains/category";

describe("InterviewFacadeService", () => {
  let service: InterviewFacadeService;
  let interviewService: InterviewService;
  let questionService: QuestionService;
  let rootQuestionService: RootQuestionService;
  let tokenService: TokenService;
  let questionVoicePathResolver: QuestionVoicePathResolverService;

  const mockMember: Member = {
    id: 1,
    nickname: "testuser",
    profileCompleted: true
  } as Member;

  const mockRootQuestion: RootQuestion = {
    id: 100,
    content: "테스트 루트 질문입니다",
    category: CategoryType.ALGORITHM_DATA_STRUCTURE,
    state: QuestionState.ACTIVE,
    questionOrder: 1,
    createdAt: new Date(),
    interviews: []
  } as RootQuestion;

  const mockInterview: Interview = {
    id: 200,
    memberId: 1,
    rootQuestionId: 100,
    maxQuestionCount: 10,
    interviewMode: InterviewMode.TEXT,
    interviewState: InterviewState.IN_PROGRESS,
    totalScore: null,
    totalFeedback: null,
    likeCount: 0,
    viewCount: 0,
    createdAt: new Date(),
    member: mockMember,
    rootQuestion: mockRootQuestion,
    questions: [],
    interviewLikes: [],
    validateMaxQuestionCount: jest.fn(),
    isInterviewee: jest.fn(),
    isInProgress: jest.fn(),
    evaluate: jest.fn()
  } as unknown as Interview;

  const mockQuestion: Question = {
    id: 300,
    interviewId: 200,
    content: "테스트 루트 질문입니다",
    createdAt: new Date()
  } as Question;

  const mockTransactionManager = {
    create: jest.fn(),
    save: jest.fn()
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewFacadeService,
        {
          provide: InterviewService,
          useValue: {
            saveInterview: jest.fn()
          }
        },
        {
          provide: QuestionService,
          useValue: {
            createQuestion: jest.fn()
          }
        },
        {
          provide: RootQuestionService,
          useValue: {
            findById: jest.fn()
          }
        },
        {
          provide: TokenService,
          useValue: {
            validateEnoughTokens: jest.fn()
          }
        },
        {
          provide: QuestionVoicePathResolverService,
          useValue: {
            resolveRootQuestionCdnPath: jest.fn(),
            resolveNextQuestionCdnPath: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<InterviewFacadeService>(InterviewFacadeService);
    interviewService = module.get<InterviewService>(InterviewService);
    questionService = module.get<QuestionService>(QuestionService);
    rootQuestionService = module.get<RootQuestionService>(RootQuestionService);
    tokenService = module.get<TokenService>(TokenService);
    questionVoicePathResolver = module.get<QuestionVoicePathResolverService>(
      QuestionVoicePathResolverService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createCustomInterview - TEXT mode", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 100,
      maxQuestionCount: 10,
      mode: InterviewMode.TEXT
    };

    beforeEach(() => {
      jest
        .spyOn(rootQuestionService, "findById")
        .mockResolvedValue(mockRootQuestion);
      jest
        .spyOn(interviewService, "saveInterview")
        .mockResolvedValue(mockInterview);
      jest
        .spyOn(questionService, "createQuestion")
        .mockResolvedValue(mockQuestion);
      jest
        .spyOn(tokenService, "validateEnoughTokens")
        .mockResolvedValue(undefined);
    });

    it("should create interview in TEXT mode", async () => {
      const result = await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(result).toBeInstanceOf(CreateCustomInterviewTextModeResponse);
      expect(
        (result as CreateCustomInterviewTextModeResponse).interview_id
      ).toBe(200);
      expect(
        (result as CreateCustomInterviewTextModeResponse).question_id
      ).toBe(300);
      expect(
        (result as CreateCustomInterviewTextModeResponse).root_question
      ).toBe("테스트 루트 질문입니다");
    });

    it("should validate root question exists", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(rootQuestionService.findById).toHaveBeenCalledWith(100);
    });

    it("should validate token availability", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(tokenService.validateEnoughTokens).toHaveBeenCalledWith(
        mockMember.id,
        expect.any(Number)
      );
    });

    it("should save interview with transaction", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(interviewService.saveInterview).toHaveBeenCalledWith(
        mockTransactionManager,
        expect.any(Object)
      );
    });

    it("should create initial question", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(questionService.createQuestion).toHaveBeenCalled();
    });
  });

  describe("createCustomInterview - VOICE mode", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 100,
      maxQuestionCount: 10,
      mode: InterviewMode.VOICE
    };

    const mockVoiceInterview = {
      ...mockInterview,
      interviewMode: InterviewMode.VOICE,
      questions: [mockQuestion]
    } as Interview;

    const mockVoiceUrl =
      "https://cloudfront.net/interview/next-question-voice/300.wav";

    beforeEach(() => {
      jest
        .spyOn(rootQuestionService, "findById")
        .mockResolvedValue(mockRootQuestion);
      jest
        .spyOn(interviewService, "saveInterview")
        .mockResolvedValue(mockVoiceInterview);
      jest
        .spyOn(questionService, "createQuestion")
        .mockResolvedValue(mockQuestion);
      jest
        .spyOn(tokenService, "validateEnoughTokens")
        .mockResolvedValue(undefined);
      jest
        .spyOn(questionVoicePathResolver, "resolveNextQuestionCdnPath")
        .mockReturnValue(mockVoiceUrl);
    });

    it("should create interview in VOICE mode", async () => {
      const result = await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(result).toBeInstanceOf(CreateCustomInterviewVoiceModeResponse);
      expect(
        (result as CreateCustomInterviewVoiceModeResponse).interview_id
      ).toBe(200);
      expect(
        (result as CreateCustomInterviewVoiceModeResponse).question_id
      ).toBe(300);
      expect(
        (result as CreateCustomInterviewVoiceModeResponse)
          .root_question_voice_url
      ).toBe(mockVoiceUrl);
    });

    it("should resolve voice URL for VOICE mode", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(
        questionVoicePathResolver.resolveNextQuestionCdnPath
      ).toHaveBeenCalledWith(mockQuestion.id);
    });

    it("should validate higher token count for VOICE mode", async () => {
      await service.createCustomInterview(
        mockMember,
        dto,
        mockTransactionManager
      );

      expect(tokenService.validateEnoughTokens).toHaveBeenCalledWith(
        mockMember.id,
        expect.any(Number)
      );
    });
  });

  describe("error handling", () => {
    const dto: CreateCustomInterviewDto = {
      rootQuestionId: 999,
      maxQuestionCount: 10,
      interviewMode: InterviewMode.TEXT
    };

    it("should throw error if root question not found", async () => {
      jest
        .spyOn(rootQuestionService, "findById")
        .mockRejectedValue(new Error("Root question not found"));

      await expect(
        service.createCustomInterview(mockMember, dto, mockTransactionManager)
      ).rejects.toThrow("Root question not found");
    });

    it("should throw error if token validation fails", async () => {
      jest
        .spyOn(rootQuestionService, "findById")
        .mockResolvedValue(mockRootQuestion);
      jest
        .spyOn(tokenService, "validateEnoughTokens")
        .mockRejectedValue(new Error("Insufficient tokens"));

      await expect(
        service.createCustomInterview(mockMember, dto, mockTransactionManager)
      ).rejects.toThrow("Insufficient tokens");
    });
  });

  describe("token calculation", () => {
    it("should calculate correct token count for different question counts", async () => {
      jest
        .spyOn(rootQuestionService, "findById")
        .mockResolvedValue(mockRootQuestion);
      jest
        .spyOn(interviewService, "saveInterview")
        .mockResolvedValue(mockInterview);
      jest
        .spyOn(questionService, "createQuestion")
        .mockResolvedValue(mockQuestion);
      jest
        .spyOn(tokenService, "validateEnoughTokens")
        .mockResolvedValue(undefined);

      const testCases = [
        { maxQuestionCount: 5, mode: InterviewMode.TEXT },
        { maxQuestionCount: 10, mode: InterviewMode.TEXT },
        { maxQuestionCount: 15, mode: InterviewMode.VOICE }
      ];

      for (const testCase of testCases) {
        const dto: CreateCustomInterviewDto = {
          rootQuestionId: 100,
          maxQuestionCount: testCase.maxQuestionCount,
          mode: testCase.mode
        };

        await service.createCustomInterview(
          mockMember,
          dto,
          mockTransactionManager
        );

        expect(tokenService.validateEnoughTokens).toHaveBeenCalled();
      }
    });
  });
});
