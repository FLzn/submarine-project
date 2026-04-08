export interface SendSmsInput {
  phoneNumber: string;
  message: string;
  reference: string;
  account?: string | number;
}

export interface SendSmsResult {
  externalId: string;
  status: string | number;
  description?: string;
}

export interface ISmsProvider {
  send(input: SendSmsInput): Promise<SendSmsResult>;
}
