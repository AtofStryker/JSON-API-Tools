/***
 * HttpClient
 * @module
 */

export interface HttpClientOptions {
  urlPrefix: string;
  headers?: Object;
  addHeadersBeforeRequest?: Function;
}

export enum HttpMethod {
  GET = `GET`,
  PATCH = `PATCH`,
  POST = `POST`,
  DELETE = `DELETE`,
}

export interface HttpClientQueryOptions {
  [index: string]: any;
  include?: string;
}

/**
 * HttpClient which works with data over HTTP, based on the options that
 * are passed to it's constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * @param {HttpClientOptions} options -  An object that contains properties:
 * `urlPrefix`,
 * that defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response
 * `defaultHeaders`,
 * a JSON object that contains static headers to be sent with every request
 * `addHeadersBeforeRequest`,
 * a function that returns a JSON object that returns an object of headers to be sent with each request
 */
export default abstract class HttpClient<T> {
  urlPrefix: string;
  serializeRequests: boolean = false;
  defaultHeaders: Object;
  addHeadersBeforeRequest: Function;
  protected _outstandingRequests: Set<Promise<any>>;

  constructor(options: HttpClientOptions = { urlPrefix: "" }) {
    this.urlPrefix = options.urlPrefix;
    this.serializeRequests = false;
    this._outstandingRequests = new Set();

    this.defaultHeaders = options.headers || {};
    this.addHeadersBeforeRequest =
      options.addHeadersBeforeRequest ||
      (() => {
        return {};
      });
  }

  buildUrl(type: string | number | null, id?: string | null) {
    let idPath = `/${id}`;
    let typePath = `/${type}`;
    let path = this.urlPrefix || "";

    path += typePath;

    if (id != null) {
      path += idPath;
    }

    return `${path}/`;
  }

  /**
   * Get entity by link.
   * @private
   * @param {string} link - Link to entity.
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  async get(link: string, query?: HttpClientQueryOptions): Promise<T> {
    return this._http(HttpMethod.GET, link, query);
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  async create(link: string, payload: Object): Promise<T> {
    return this._http(HttpMethod.POST, link, payload);
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  async update(link: string, payload: Object) {
    return this._http(HttpMethod.PATCH, link, payload);
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  async destroy(link: string) {
    return this._http(HttpMethod.DELETE, link);
  }

  /**
   * Make a generic request that requires more options then CRUD methods provided.
   * Does not set default `Accept` or `Content-Type`. This must be provided!
   * @param {string} url - URL where the request is being sent.
   * @param {object} options - any options the user wants to pass to the request.
   * this can contain `method`, `headers`, and `data`
   * @returns {Promise} Promise relating to request.
   */
  request(
    url: string,
    options: {
      [key: string]: any;
    } = {}
  ): Promise<any> {
    options.method = options.method || HttpMethod.GET;
    options.headers = options.headers || {};
    // set internal to true if this request in intended to go to an interal server to gain the default headers passed into the constructor
    options.internal = options.internal || false;

    // pass in data, even if none is defined to preverve _http method
    // pass in headers, even if none are defined to override default headers that are set with the _http method
    return this._http(
      options.method,
      url,
      options.data,
      options.headers,
      options.internal
    );
  }

  async _checkSerializeRequests({
    url,
    method,
    headers,
    data,
    isInternal,
  }: {
    url: string;
    method: HttpMethod;
    headers: Object;
    data: any;
    isInternal: boolean;
  }): Promise<any> {
    let promise: Promise<any>;
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests).map((promise) =>
        promise.catch(() => {})
      );

      promise = Promise.all(promises).then(() =>
        this._makeRequest({ url, method, headers, data, isInternal })
      );
    } else {
      promise = this._makeRequest({ url, method, headers, data, isInternal });
    }

    this._outstandingRequests.add(promise);
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise);
    };
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests);

    return await promise;
  }

  async _http(
    method: HttpMethod,
    url: string,
    data?: Object | null | undefined,
    headers: Object = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    isInternal: boolean = true
  ): Promise<T> {
    return (await this._checkSerializeRequests({
      url,
      method,
      headers,
      data,
      isInternal,
    })) as T;
  }

  abstract async _makeRequest({
    url,
    method,
    headers,
    data,
    isInternal,
  }: {
    url: string;
    method: HttpMethod;
    headers: Object;
    data: any;
    isInternal: boolean;
  }): Promise<any>;
}
