import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiResponse as SwaggerApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

// ------------------------------ Types ------------------------------

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  take!: number;

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export interface ApiResponse<T> {
  message: string[];
  meta?: PaginationMeta;
  data: T;
}

export interface ApiErrorResponse {
  message: string[];
  data: null;
}

// ------------------------------ Helpers ------------------------------

const toArray = (m: string | string[]): string[] => (Array.isArray(m) ? m : [m]);

export const ok = <T>(data: T, message: string | string[] = 'OK'): ApiResponse<T> => ({
  message: toArray(message),
  data,
});

export const paginated = <T>(
  data: T,
  meta: PaginationMeta,
  message: string | string[] = 'OK',
): ApiResponse<T> => ({
  message: toArray(message),
  meta,
  data,
});

export const buildPaginationMeta = (
  page: number,
  take: number,
  total: number,
): PaginationMeta => ({
  page,
  take,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / take),
});

// ------------------------------ Swagger ------------------------------

interface EnvelopeOptions {
  array?: boolean;
  paginated?: boolean;
  message?: string[];
  description?: string;
}

function envelopeSchema(dataType: Type<unknown>, opts: EnvelopeOptions = {}) {
  const dataSchema = opts.array
    ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
    : { $ref: getSchemaPath(dataType) };

  const properties: Record<string, unknown> = {
    message: {
      type: 'array',
      items: { type: 'string' },
      example: opts.message ?? ['OK'],
    },
    data: dataSchema,
  };

  const required = ['message', 'data'];

  if (opts.paginated) {
    properties.meta = { $ref: getSchemaPath(PaginationMeta) };
    required.push('meta');
  }

  return { type: 'object', properties, required };
}

export function ApiOkEnvelope<T extends Type<unknown>>(
  dataType: T,
  opts: EnvelopeOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(dataType, PaginationMeta),
    ApiOkResponse({
      description: opts.description,
      schema: envelopeSchema(dataType, opts) as never,
    }),
  );
}

export function ApiCreatedEnvelope<T extends Type<unknown>>(
  dataType: T,
  opts: EnvelopeOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(dataType, PaginationMeta),
    ApiCreatedResponse({
      description: opts.description,
      schema: envelopeSchema(dataType, opts) as never,
    }),
  );
}

export function ApiErrorEnvelope(
  status: number,
  exampleMessages: string[] = ['Error'],
  description?: string,
) {
  return applyDecorators(
    SwaggerApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'array',
            items: { type: 'string' },
            example: exampleMessages,
          },
          data: { nullable: true, example: null },
        },
        required: ['message', 'data'],
      } as never,
    }),
  );
}
