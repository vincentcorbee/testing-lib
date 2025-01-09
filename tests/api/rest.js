export class RestApi {
  #ssoAccessToken;
  #ssoAccessTokenBackstage;
  #ssoAccessTokenDebug;
  #restEndpoint;

  constructor({ restEndpoint = '', ssoAccessTokenBackstage = '', ssoAccessToken = '', ssoAccessTokenDebug = '' }) {
    this.#ssoAccessToken = ssoAccessToken;
    this.#ssoAccessTokenBackstage = ssoAccessTokenBackstage;
    this.#ssoAccessTokenDebug = ssoAccessTokenDebug;
    this.#restEndpoint = restEndpoint;
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

  async #performRequest(request) {
    const { ssoAccessToken, payload, method, endpoint, contentType } = request;

    let body = null;

    const headers = {
      'x-sso-access-token': ssoAccessToken,
    };

    if (contentType) headers['content-type'] = contentType;

    if (payload) body = typeof payload !== 'string' ? JSON.stringify(payload) : payload;

    const response = await fetch(`${this.#restEndpoint}${endpoint}`, {
      method,
      headers,
      body,
    });

    const result = await response.json();

    return result;
  }

  memberRelationIPIBaseNumberWasAdded(user, ipBaseNumber) {
    const createBusinessRelationNumber = () => {
      return Math.floor(Math.random() * 100000000);
    };

    const payload = {
      data: {
        Body: {
          MemberRelationIPIBaseNumberWasAdded: {
            Relation: {
              BusRelAccount: createBusinessRelationNumber(),
              BusRelTypeID: 'BS Relation',
              CustGroup: 'ACA',
              IPIIPBaseNumber: ipBaseNumber,
              MarktselectID: '',
              Party: '5645831012',
              RelationIPType: 'N',
              RelationMemberType: 'CA',
              Status: 'Active',
              Testator: '',
              VendGroup: 'ACA',
              WebEnabled: [0, 'No'],
              LanguageId: user.personalDetails.nationality,
              Name: `${user.personalDetails.firstNames} ${user.personalDetails.lastName}`,
              DateOfBirth: user.personalDetails.dateOfBirth,
              DateOfDeath: '--',
            },
            RelationPostalAddresses: {
              RelationPostalAddress: [
                {
                  Address: 'Redacted',
                  City: user.personalContactDetails.city,
                  CountryRegionId: user.personalContactDetails.country,
                  County: '',
                  Location: '5647487855',
                  State: '',
                  Street: user.personalContactDetails.street,
                  StreetNumber: user.personalContactDetails.houseNumber,
                  ValidFrom: '2024-07-31T08:30:46',
                  ValidTo: '2154-12-31T23:59:59',
                  ZipCode: '1234 CR',
                },
              ],
            },
            RelationElectronicAddresses: {
              RelationElectronicAddress: [
                {
                  Location: '5647487856',
                  Locator: user.personalContactDetails.telephoneNumber,
                  Type: 'Phone',
                  ValidFrom: '2024-07-31T08:30:46',
                  ValidTo: '2154-12-31T23:59:59',
                },
                {
                  Location: '5647487857',
                  Locator: user.personalContactDetails.email,
                  Type: 'Email',
                  ValidFrom: '2024-07-31T08:30:46',
                  ValidTo: '2154-12-31T23:59:59',
                },
              ],
            },
            RelationBankAccount: {
              BankIBAN: user.personalPaymentDetails.iBAN,
              SWIFTNo: user.personalPaymentDetails.bic,
              VendAccount: user.personalPaymentDetails.bankAccountNumber,
            },
          },
        },
      },
    };

    return this.#performRequest({
      ssoAccessToken: this.#ssoAccessTokenDebug,
      payload,
      method: 'POST',
      endpoint: '/users/membership-registration/kafka/member-relation-ipi-base-number-was-added',
      contentType: 'application/json',
    });
  }
}
