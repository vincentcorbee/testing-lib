/* Set Cookie: https://datatracker.ietf.org/doc/html/rfc6265 */

export type CookieAttributes = Record<string, any>;

export type Cookie = {
  key: string;
  value?: string | null;
  attributes?: Record<string, any>;
};

const MAX_AGE_ATTRIBUTE = 'Max-Age';
const EXPIRES_ATTRIBUTE = 'Expires';
const DOMAIN_ATTRIBUTE = 'Domain';
const PATH_ATTRIBUTE = 'Path';
const SECURE_ATTRIBUTE = 'Secure';
const HTTP_ONLY_ATTRIBUTE = 'HttpOnly';

const KEY_VALUE_SEPARATOR = '=';
const ATTRIBUTE_DELIMITER = ';';
const WHITE_SPACE = ' ';

const AttributesMap = new Map([
  [EXPIRES_ATTRIBUTE.toLowerCase(), EXPIRES_ATTRIBUTE],
  [MAX_AGE_ATTRIBUTE.toLowerCase(), MAX_AGE_ATTRIBUTE],
  [DOMAIN_ATTRIBUTE.toLowerCase(), DOMAIN_ATTRIBUTE],
  [PATH_ATTRIBUTE.toLowerCase(), PATH_ATTRIBUTE],
  [SECURE_ATTRIBUTE.toLowerCase(), SECURE_ATTRIBUTE],
  [HTTP_ONLY_ATTRIBUTE.toLocaleLowerCase(), HTTP_ONLY_ATTRIBUTE],
]);

const BooleanAttributes = new Set([SECURE_ATTRIBUTE, HTTP_ONLY_ATTRIBUTE]);

function getAttributeValue(attributeName: string, value: any) {
  switch (attributeName) {
    case EXPIRES_ATTRIBUTE:
      return value instanceof Date ? value.toUTCString() : new Date(value).toUTCString();
    default:
      return encodeURIComponent(value);
  }
}

function createCookie(key: string, value = '') {
  return `${key}${KEY_VALUE_SEPARATOR}${value}`;
}

function createCookieAttribute(name: string, value: any) {
  const attributeName = AttributesMap.get(name.toLowerCase());

  if (attributeName === undefined) return null;

  let cookieAttribute: string;

  if (BooleanAttributes.has(attributeName)) {
    cookieAttribute = attributeName;
  } else {
    cookieAttribute = createCookie(attributeName, getAttributeValue(attributeName, value));
  }

  return `${ATTRIBUTE_DELIMITER}${WHITE_SPACE}${cookieAttribute}`;
}

/* Note that the expires attribute value needs to be a UTCString see: https://datatracker.ietf.org/doc/html/rfc2616#section-3.3 */
function addCookieAttributes(cookie: string, attributes: CookieAttributes) {
  let result = cookie;

  for (const [name, value] of Object.entries(attributes)) {
    const cookieAttribute = createCookieAttribute(name, value);

    if (cookieAttribute !== null) result += cookieAttribute;
  }

  return result;
}

export function getCookie<Cookies extends Record<string, string> = Record<string, string>>(
  ...cookieNames: string[]
): Cookies {
  const cookies = {};

  /*
    document.cookie returns a list of key value pairs seperated by a semi colon.
    It wil not return the attributes of the cookie. So the semi colon is not used to signify cookie attributes.
  */
  document.cookie.split(ATTRIBUTE_DELIMITER).forEach((cookie) => {
    if (cookie.includes(KEY_VALUE_SEPARATOR)) {
      const [key, value] = cookie.split(KEY_VALUE_SEPARATOR);

      cookies[key.trim()] = decodeURIComponent(value.trim());
    }
  });

  if (cookieNames.length === 0) return cookies as Cookies;

  const result = {};

  for (const name of cookieNames) result[name] = cookies[name];

  return result as Cookies;
}

/* Note, to remove a cookie, the Path and the Domain attribute must match with the existing cookie. */
export function removeCookie(cookie: Cookie) {
  const { key, attributes = {} } = cookie;
  const date = new Date();

  /* The date has to be set in the past in order to remove the cookie */

  date.setDate(date.getDate() - 1);

  attributes.expires = date;

  document.cookie = addCookieAttributes(createCookie(key), attributes);
}

export function setCookie(...cookies: Cookie[]) {
  cookies.forEach((cookie) => {
    const { key, value, attributes = {} } = cookie;

    /* If the value is set to null, the cookie will be removed */
    if (value === null) {
      removeCookie({ key, attributes });
    } else if (value !== undefined) {
      document.cookie = addCookieAttributes(createCookie(key, encodeURIComponent(value)), attributes);
    }
  });
}
