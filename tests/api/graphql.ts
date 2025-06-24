export class GraphQL {
  #ssoAccessToken;
  #ssoAccessTokenBackstage;
  #ssoAccessTokenDebug;
  #graphqlEndpoint;

  constructor({ graphqlEndpoint = '', ssoAccessTokenBackstage = '', ssoAccessToken = '', ssoAccessTokenDebug = '' }) {
    this.#ssoAccessToken = ssoAccessToken;
    this.#ssoAccessTokenBackstage = ssoAccessTokenBackstage;
    this.#ssoAccessTokenDebug = ssoAccessTokenDebug;
    this.#graphqlEndpoint = graphqlEndpoint;
  }

  set ssoAccessToken(token: string) {
    this.#ssoAccessToken = token;
  }

  set ssoAccessTokenBackstage(token: string) {
    this.#ssoAccessTokenBackstage = token;
  }

  set ssoAccessTokenDebug(token: string) {
    this.#ssoAccessTokenDebug = token;
  }

  async #performGraphQLQuery(query: any, variables = {}, ssoAccessToken: string) {
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

  blockIdentificationByIdentificationDocument(registrationId: string) {
    const query = `mutation($input: BlockIdentificationByIdentificationDocumentInputType!) {
      blockIdentificationByIdentificationDocument(input: $input) {
        id
        state

        identification {
          firstNames
          lastName
          state
          mode
          dateCreated
        }

      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessTokenBackstage);
  }

  approveIdentificationByIdentificationDocument(registrationId: string) {
    const query = `mutation($input: ValidateIdentificationByIdentificationDocumentInputType!) {
      approveIdentificationByIdentificationDocument(input: $input) {
        id
        state

        identification {
          firstNames
          lastName
          state
          mode
          dateCreated
        }

      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessTokenBackstage);
  }

  membershipActiveRegistrations() {
    const query = `query {
      membershipActiveRegistrations {
        state
        id
        identification {
          id
        }
        ... on AuthorRegistrationObjectType {
          rightsholder {
            ipBaseNumber
          }
        }
      }
    }`;

    return this.#performGraphQLQuery(query, {}, this.#ssoAccessToken);
  }

  approvePersonalPaymentDetails(registrationId: string) {
    const query = `mutation($input: ApprovePersonalPaymentDetailsInputType!) {
      approvePersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  blockPersonalPaymentDetails(registrationId: string) {
    const query = `mutation($input: BlockPersonalPaymentDetailsInputType!) {
      blockPersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  setRegistrationDetailsValidated(registrationId: string) {
    const query = `mutation($input: RegistrationStateInputType!) {
      setRegistrationDetailsValidated(input: $input)
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenDebug);
  }

  etRightsholderApproved(registrationId: string) {
    const query = `mutation($input: RegistrationStateInputType!) {
      setRightsholderApproved(input: $input)
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenDebug);
  }

  setRightsholderAsNew(registrationId: string) {
    const query = `mutation($input: RightsholderDetailsInputType!) {
      setRightsholderAsNew(input: $input) {
        state
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  getRegistrationAuthor(registrationId: string) {
    const query = `query($input: GetRegistrationInputType!) {
      getRegistrationAuthor(input: $input) {
        shareholder {
          ipBaseNumber
        }

        identification {
          id
        }
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenDebug);
  }

  getRegistration(registrationId: string) {
    const query = `query getRegistration($input: RegistrationGetInputType!) {
      membershipRegistrationById(input: $input) {
        identification {
          id
        }
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessToken);
  }

  approveCompanyDetails(registrationId: string) {
    const query = `mutation($input: ApproveCompanyDetailsInputType!) {
      approveCompanyDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }
}
