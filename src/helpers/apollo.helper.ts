export enum ApolloCodeEnum {
  GRAPHQL_PARSE_FAILED = 'GRAPHQL_PARSE_FAILED',
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

class ApolloCodeSingleton {
  private static self: ApolloCodeSingleton;

  public static getInstance(): ApolloCodeSingleton {
    if (!ApolloCodeSingleton.self) {
      ApolloCodeSingleton.self = new ApolloCodeSingleton();
    }
    return ApolloCodeSingleton.self;
  }

  public codeFromHttpStatus(status?: number): ApolloCodeEnum {
    switch (status) {
      // HttpStatus.BAD_REQUEST:
      case 400:
        return ApolloCodeEnum.BAD_USER_INPUT;
      // HttpStatus.FORBIDDEN:
      case 403:
        return ApolloCodeEnum.FORBIDDEN;
      // HttpStatus.UNAUTHORIZED
      case 401:
        return ApolloCodeEnum.UNAUTHENTICATED;
      // HttpStatus.INTERNAL_SERVER_ERROR
      default:
        return ApolloCodeEnum.INTERNAL_SERVER_ERROR;
    }
  }
}

export const ApolloHelper = ApolloCodeSingleton.getInstance();
