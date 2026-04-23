import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BusinessRuleViolation,
  DomainException,
  NotFoundDomainError,
} from '../exceptions/domain.exception';
import { ApiErrorResponse } from '../utils/api-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.resolve(exception);
    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: ApiErrorResponse } {
    if (exception instanceof NotFoundDomainError) {
      return {
        status: HttpStatus.NOT_FOUND,
        body: { message: [exception.message], data: null },
      };
    }
    if (exception instanceof BusinessRuleViolation) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        body: { message: [exception.message], data: null },
      };
    }
    if (exception instanceof DomainException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: { message: [exception.message], data: null },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      return { status, body: { message: this.normalizeHttp(payload, exception), data: null } };
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : undefined,
    );
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: ['Internal server error'], data: null },
    };
  }

  private normalizeHttp(payload: unknown, exception: HttpException): string[] {
    if (typeof payload === 'string') return [payload];
    if (payload && typeof payload === 'object') {
      const r = payload as { message?: string | string[] };
      const raw = r.message ?? exception.message;
      return Array.isArray(raw) ? raw : [raw];
    }
    return [exception.message];
  }
}
