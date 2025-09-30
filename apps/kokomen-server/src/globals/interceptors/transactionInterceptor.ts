import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      console.log("TransactionStarted");

      // GraphQL 컨텍스트에서 request 가져오기
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();

      if (!ctx || !ctx.req) {
        await queryRunner.release();
        throw new InternalServerErrorException("Invalid context");
      }

      ctx.req.queryRunnerManager = queryRunner.manager;

      return next.handle().pipe(
        catchError(async (error) => {
          console.error(error);
          await queryRunner.rollbackTransaction();
          await queryRunner.release();

          if (error instanceof HttpException) {
            throw new HttpException(error.getResponse(), error.getStatus());
          }
          throw new InternalServerErrorException();
        }),
        tap(async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
          console.log("TransactionCommitted");
        })
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
