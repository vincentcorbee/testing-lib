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

  set ssoAccessToken(token) {
    this.#ssoAccessToken = token;
  }

  set ssoAccessTokenBackstage(token) {
    this.#ssoAccessTokenBackstage = token;
  }

  set ssoAccessTokenDebug(token) {
    this.#ssoAccessTokenDebug = token;
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

  blockIdentificationByIdentificationDocument(registrationId) {
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

  approveIdentificationByIdentificationDocument(registrationId) {
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

  approvePersonalPaymentDetails(registrationId) {
    const query = `mutation($input: ApprovePersonalPaymentDetailsInputType!) {
      approvePersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  blockPersonalPaymentDetails(registrationId) {
    const query = `mutation($input: BlockPersonalPaymentDetailsInputType!) {
      blockPersonalPaymentDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  setRegistrationDetailsValidated(registrationId) {
    const query = `mutation($input: RegistrationStateInputType!) {
      setRegistrationDetailsValidated(input: $input)
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenDebug);
  }

  etRightsholderApproved(registrationId) {
    const query = `mutation($input: RegistrationStateInputType!) {
      setRightsholderApproved(input: $input)
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenDebug);
  }

  setRightsholderAsNew(registrationId) {
    const query = `mutation($input: RightsholderDetailsInputType!) {
      setRightsholderAsNew(input: $input) {
        state
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }

  getRegistrationAuthor(registrationId) {
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

  getRegistration(registrationId) {
    const query = `query getRegistration($input: RegistrationGetInputType!) {
      membershipRegistrationById(input: $input) {
        identification {
          id
        }
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { id: registrationId } }, this.#ssoAccessToken);
  }

  approveCompanyDetails(registrationId) {
    const query = `mutation($input: ApproveCompanyDetailsInputType!) {
      approveCompanyDetails(input: $input) {
        id
      }
    }`;

    return this.#performGraphQLQuery(query, { input: { registrationId } }, this.#ssoAccessTokenBackstage);
  }
}
