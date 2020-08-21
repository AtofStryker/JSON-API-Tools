import HttpClient from "@atofstryker/json-api-http-client";
import Parser from "@atofstryker/json-api-parser";
import { RawResponse, ResourceModel } from "@atofstryker/json-api-types";
import ApiClient from "../base";
import { isArray } from "lodash";

export default class JsonApiClient implements ApiClient {
  private _parser: Parser;
  private _httpClient: HttpClient<RawResponse>;

  constructor(httpClientInstance: HttpClient<RawResponse>) {
    this._parser = new Parser();
    this._httpClient = httpClientInstance;
  }

  private _parseRawResponse(response: RawResponse): RawResponse {
    const parsedResponse: any = {};

    const { data, included } = response;

    if (isArray(data)) {
      parsedResponse.data = data.map(
        (datum) => this._parser.parse(datum) as ResourceModel
      );
    } else {
      parsedResponse.data = this._parser.parse(data) as ResourceModel;
    }

    if (included) {
      parsedResponse.included = included.map(
        (datum) => this._parser.parse(datum) as ResourceModel
      );
    }
    return parsedResponse as RawResponse;
  }

  async get(
    type: string,
    id?: string | null,
    options: { [key: string]: any } = {}
  ): Promise<RawResponse> {
    let { query, link } = options;
    const rawResource: RawResponse = await this._httpClient.get(
      link || this._httpClient.buildUrl(type, id),
      query
    );

    return this._parseRawResponse(rawResource);
  }

  async create(resource: ResourceModel): Promise<ResourceModel> {
    let data = this._parser.serialize(resource);

    const created: RawResponse = await this._httpClient.create(
      this._httpClient.buildUrl(resource.type, resource.id),
      { data }
    );

    return this._parseRawResponse(created).data as ResourceModel;
  }

  async update(resource: Partial<ResourceModel>): Promise<ResourceModel> {
    let data = this._parser.serialize(resource);

    const link = resource?.links?.self || null;

    if (!link) {
      throw Error("No link was provided for updating resource");
    }

    const updated: RawResponse = await this._httpClient.update(link, {
      data,
    });

    return this._parseRawResponse(updated).data as ResourceModel;
  }

  async delete(resource: Partial<ResourceModel>) {
    const link = resource?.links?.self || null;

    if (!link) {
      throw Error("No link was provided for deleting resource");
    }
    await this._httpClient.destroy(link);
  }
}
