import { BaseException, IllegalArgumentException } from "./exceptions";

interface BasicAssertParam {
  aMessage?: string;
  exception?: BaseException;
  loc?: string[];
  code?: string;
}

export class AssertionConcern {
  private simpleHandleABoolean(
    aBoolean: boolean,
    aMessage?: string,
    exception?: BaseException,
    loc?: string[],
    code?: string
  ) {
    if (aBoolean) {
      throw (
        exception ||
        new IllegalArgumentException({ message: aMessage, loc, code })
      );
    }
  }
  public assertArgumentNotEmpty({
    aString,
    aMessage,
    exception,
    loc,
    code,
  }: { aString: string } & BasicAssertParam) {
    const isEmpty = aString == undefined || aString.length === 0;
    this.simpleHandleABoolean(isEmpty, aMessage, exception, loc, code);
  }

  public assertArgumentNotNull({
    aValue,
    aMessage,
    exception,
    loc,
    code,
  }: { aValue: any } & BasicAssertParam) {
    const isNull = aValue == undefined;
    this.simpleHandleABoolean(isNull, aMessage, exception, loc, code);
  }

  public assertStateTrue({
    aBoolean,
    aMessage,
    exception,
    loc,
    code,
  }: { aBoolean: boolean } & BasicAssertParam) {
    this.simpleHandleABoolean(!aBoolean, aMessage, exception, loc, code);
  }

  public assertStateFalse({
    aBoolean,
    aMessage,
    exception,
    loc,
    code,
  }: { aBoolean: boolean } & BasicAssertParam) {
    this.simpleHandleABoolean(aBoolean, aMessage, exception, loc, code);
  }

  public assertLargerThanOrEqual({
    aNumber,
    threshold,
    allowEqual = true,
    aMessage,
    exception,
    loc,
    code,
  }: {
    aNumber: number;
    threshold: number;
    allowEqual?: boolean;
  } & BasicAssertParam) {
    const isNot =
      (!allowEqual && aNumber <= threshold) ||
      (allowEqual && aNumber < threshold);
    this.simpleHandleABoolean(isNot, aMessage, exception, loc, code);
  }
}