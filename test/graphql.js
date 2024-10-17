export class GraphQL {
  #ssoAccessToken;
  #ssoAccessTokenBackstage;
  #graphqlEndpoint;

  constructor({ graphqlEndpoint = '', ssoAccessTokenBackstage = '', ssoAccessToken = '' }) {
    this.#ssoAccessToken = ssoAccessToken;
    this.#ssoAccessTokenBackstage = ssoAccessTokenBackstage;
    this.#graphqlEndpoint = graphqlEndpoint;
  }

  set ssoAccessToken(token) {
    this.#ssoAccessToken = token;
  }

  set ssoAccessTokenBackstage(token) {
    this.#ssoAccessTokenBackstage = token;
  }

  async #performGraphQLQuery(query, variables = {}, ssoAccessToken) {
    const response = await fetch(this.#graphqlEndpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sso-access-token': ssoAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    return result;
  }

  async blockIdentificationByIdentificationDocument(registrationId) {
    const query = `mutation($input: BlockIdentificationByIdentificationDocumentInputType!) {
      blockIdentificationByIdentificationDocument(input: $input) {
        id
        state
        ... on AuthorRegistrationObjectType {
          identification(role: "prospective_member") {
            firstNames
            lastName
            state
            mode
            dateCreated
          }
        }
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessTokenBackstage);
  }

  async approveIdentificationByIdentificationDocument(registrationId) {
    const query = `mutation($input: ValidateIdentificationByIdentificationDocumentInputType!) {
      approveIdentificationByIdentificationDocument(input: $input) {
        id
        state
        ... on AuthorRegistrationObjectType {
          identification(role: "prospective_member") {
            firstNames
            lastName
            state
            mode
            dateCreated
          }
        }
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessTokenBackstage);
  }

  async membershipActiveRegistrations() {
    const query = `query {
      membershipActiveRegistrations {
        state
        id
        ... on AuthorRegistrationObjectType {
          identification(role: "prospective_member") {
            id
          }
          payment {
            id
          }
        }
      }
    }`;

    return this.#performGraphQLQuery(query, {}, this.#ssoAccessToken);
  }

  async approvePersonalPaymentDetails(registrationId) {
    const query = `mutation($input: ApprovePersonalPaymentDetailsInputType!) {
      approvePersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  async blockPersonalPaymentDetails(registrationId) {
    const query = `mutation($input: BlockPersonalPaymentDetailsInputType!) {
      blockPersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  async approveTransferPayment(paymentId) {
    const query = `mutation($input: ApproveTransferPaymentInputType!) {
      approveTransferPayment(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: paymentId } }, this.#ssoAccessTokenBackstage);
  }
}
