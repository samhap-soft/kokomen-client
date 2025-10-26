import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { catchError, Observable, tap } from "rxjs";
import { AuthenticatedRequest } from "src/globals/types/request.type";
import { DataSource, EntityManager } from "typeorm";

@Injectable()
export class TransactionInterceptorForGraphQL implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptorForGraphQL.name);
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // GraphQL 컨텍스트에서 request 가져오기
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext<{
        req: AuthenticatedRequest & { queryRunnerManager: EntityManager };
      }>();

      if (!ctx || !ctx.req) {
        await queryRunner.release();
        throw new InternalServerErrorException("Invalid context");
      }

      ctx.req.queryRunnerManager = queryRunner.manager;

      return next.handle().pipe(
        catchError(async (error) => {
          this.logger.error("error in transaction", error);
          await queryRunner.rollbackTransaction();
          await queryRunner.release();

          if (error instanceof HttpException) {
            throw new HttpException(error.getResponse(), error.getStatus());
          }
          throw new InternalServerErrorException();
        }),
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        tap(async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        })
      );
    } catch (error) {
      this.logger.error("unhandled error", error);
      throw new InternalServerErrorException();
    }
  }
}

@Injectable()
export class TransactionInterceptorForHTTP implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptorForGraphQL.name);
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    try {
      const req = context
        .switchToHttp()
        .getRequest<
          AuthenticatedRequest & { queryRunnerManager: EntityManager }
        >();
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      req.queryRunnerManager = queryRunner.manager;

      return next.handle().pipe(
        catchError(async (error) => {
          this.logger.error("error in transaction", error);
          await queryRunner.rollbackTransaction();
          await queryRunner.release();

          if (error instanceof HttpException) {
            throw new HttpException(error.getResponse(), error.getStatus());
          }
          throw new InternalServerErrorException();
        }),
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        tap(async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        })
      );
    } catch (error) {
      this.logger.error("unhandled error", error);
      throw new InternalServerErrorException();
    }
  }
}
