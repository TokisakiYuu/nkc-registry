class ClientError extends Error {
  constructor(code?: number, message?: string) {
    super(message);
    this.status = code;
  }

  status: number;
}

export default ClientError;
