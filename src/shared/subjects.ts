import { Subject } from '../rx/index.js';

export type RequestEventBase = {
  type: 'fetch' | 'xhr';
  method: string;
  url: URL;
  status: number;
  json: () => Promise<any>;
};

export type FetchRequestEvent = {
  type: 'fetch';
  response: Response;
  body: RequestInit['body'];
} & RequestEventBase;

export type XMLHttpRequestRequestEvent = {
  type: 'xhr';
  body: any;
  response: XMLHttpRequest['response'];
  responseType: XMLHttpRequestResponseType;
  responseXML: XMLHttpRequest['responseXML'];
  responseText: XMLHttpRequest['responseText'];
} & RequestEventBase;

export type RequestEvent = FetchRequestEvent | XMLHttpRequestRequestEvent;

export const requestSubject = new Subject<RequestEvent>();
