export interface ExceptionProps {
  message?: string;
  code?: string;
  loc?: string[];
}

export class BaseException extends Error {
  private code?: string;
  private loc?: string[];

  constructor({ message, code, loc }: ExceptionProps) {
    super(message);
    this.code = code;
    this.loc = loc;
  }

  public getCode(): string | null {
    return this.code;
  }

  public getMessage(): string | null {
    return this.message;
  }

  public location(): string[] | null {
    return this.loc;
  }

  public static factory({ message, code, loc }: ExceptionProps): BaseException {
    return new BaseException({ message, code, loc });
  }
}

export class IllegalArgumentException extends BaseException {
  constructor({ message, code, loc }: ExceptionProps) {
    super({ message, code, loc });
  }
  public static factory({
    message,
    code,
    loc,
  }: {
    message?: string;
    code?: string;
    loc?: string[];
  }): BaseException {
    return new IllegalArgumentException({ message, code, loc });
  }
}

export class IllegalStateException extends BaseException {
  constructor({ message, code, loc }: ExceptionProps) {
    super({ message, code, loc });
  }
  public static factory({
    message,
    code,
    loc,
  }: {
    message?: string;
    code?: string;
    loc?: string[];
  }): BaseException {
    return new IllegalArgumentException({ message, code, loc });
  }
}

export class NotFoundException extends BaseException {}
