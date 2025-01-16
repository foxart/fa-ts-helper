export enum ExceptionResponseContextEnum {
  'HTTP' = 'Http',
  'GRAPHQL' = 'Graphql',
  'RPC' = 'Rpc',
  'WS' = 'WebSocket',
  'UNKNOWN' = 'Unknown',
}

export enum ExceptionResponseTypeEnum {
  HTTP_EXCEPTION = 'HttpException',
  MONGO_ERROR = 'MongoErrorException',
  ERROR_CLASS = 'ErrorClassException',
  ERROR = 'ErrorException',
  UNKNOWN = 'UnknownException',
}

export interface ExceptionResponseInterface extends Record<string, unknown> {
  name: string;
  message: string;
  status: number;
  details?: object;
  stack?: string;
  context: ExceptionResponseContextEnum;
  type: ExceptionResponseTypeEnum;
  trace: string[];
  timestamp: string;
  metadata: unknown;
  payload: Record<string, unknown>;
}
