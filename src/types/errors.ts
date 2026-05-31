export class YnabConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "YnabConfigError";
  }
}

export class YnabApiError extends Error {
  public readonly status: number;
  public readonly requestId: string | undefined;
  public readonly retryable: boolean;

  public constructor(message: string, options: { status: number; requestId?: string; retryable: boolean }) {
    super(message);
    this.name = "YnabApiError";
    this.status = options.status;
    this.requestId = options.requestId;
    this.retryable = options.retryable;
  }
}
