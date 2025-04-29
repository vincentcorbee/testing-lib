/*
  type PostmarkOptions = {
    serverToken: string;
  };

  type PostmarkOutboundParameters = { count?: number; offset?: number; status?: string; subject?: string; fromdate?: string };
*/

const baseURL = 'https://api.postmarkapp.com/messages';

export class Postmark {
  #serverToken;

  constructor(options) {
    const { serverToken } = options;

    this.#serverToken = serverToken;
  }

  /* Offset is in hours */
  #getDatePostmark(offset = 2.5) {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: 'America/New_York',
    };

    const currentDate = new Date();

    currentDate.setHours(currentDate.getHours() - offset);

    const formated = currentDate.toLocaleString('en-US', options);
    const [date, time] = formated.split(', ');
    const [month, day, year] = date.split('/');
    const datePostmark = `${year}-${month}-${day}T${time}`;

    return datePostmark;
  }

  #getQueryParameters(parameters) {
    const urlSearchParams = new URLSearchParams();

    Object.entries(parameters).forEach(([key, value]) => urlSearchParams.append(key, value.toString()));

    const queryParameters = urlSearchParams.toString();

    return queryParameters ? `?${queryParameters}` : '';
  }

  async handleRequest(url) {
    const response = await fetch(url, {
      headers: {
        'X-Postmark-Server-Token': this.#serverToken,
        'Content-type': 'application/json',
        Accepts: 'application/json',
      },
    });

    return response.json();
  }

  outbound(parameters) {
    const queryParameters = this.#getQueryParameters(parameters);

    return this.handleRequest(`${baseURL}/outbound${queryParameters}`);
  }

  outboundEmailDetails(emailId) {
    return this.handleRequest(`${baseURL}/outbound/${emailId}/details`);
  }

  async getEmail(options) {
    const { subject, recipients = [], dateOffset = 0.2 } = options;

    const { Messages, TotalCount } = await this.outbound({
      subject,
      offset: 0,
      count: 20,
      fromdate: this.#getDatePostmark(dateOffset),
    });

    if (TotalCount === 0 || !Messages?.length) return null;

    const [message] = Messages;

    if (message.Subject !== subject) return null;
    if (recipients.length && !recipients.some((recipient) => message.To.includes(recipient))) return null;

    return message;
  }

  async isEmailSend(options) {
    const email = await this.getEmail(options);

    return !!email;
  }
}
