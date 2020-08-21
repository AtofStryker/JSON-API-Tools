/**
 * AxiosHttpClient
 * @module
 */
import AbstractHttpClient, { HttpMethod } from "../base/index";
import axios, { AxiosResponse } from "axios";

export class AxiosHttpClientError extends Error {}

export default class AxiosHttpClient<T> extends AbstractHttpClient<T> {
  async _http(
    method: HttpMethod,
    url: string,
    data?: Object | null | undefined,
    headers: Object = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    isInternal: boolean = true
  ): Promise<any> {
    if (!url) throw new AxiosHttpClientError(`url is not defined!`);

    return await super._checkSerializeRequests({
      url,
      method,
      headers,
      data,
      isInternal,
    });
  }

  async _makeRequest({
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
    // if internal requests are made, merge with the default headers
    headers = isInternal
      ? {
          ...this.defaultHeaders,
          ...this.addHeadersBeforeRequest(),
          ...headers,
        }
      : {
          ...headers,
        };

    let response: AxiosResponse<any>;

    try {
      response = await axios({
        url,
        method,
        headers,
        ...(method === HttpMethod.GET
          ? {
              params: data,
            }
          : {
              data,
            }),
      });

      if (response.status === 200 && response.data == null) {
        throw new AxiosHttpClientError(
          `request returned ${response.status} status without data`
        );
      }
      return response.data || {};
    } catch (error) {
      throw new AxiosHttpClientError(
        `request for resource '${url}' failed: ${error.message}.`
      );
    }
  }
}
