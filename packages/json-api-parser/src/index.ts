import { camelCase, kebabCase } from "lodash";
import { ResourceModel } from "@atofstryker/json-api-types";

class JsonApiParser {
  parse(resource: Partial<ResourceModel>): Partial<ResourceModel> {
    return this._serializeData(camelCase, { ...resource });
  }

  serialize(resource: Partial<ResourceModel>): Partial<ResourceModel> {
    return this._serializeData(kebabCase, { ...resource });
  }

  private _serializeData(
    keyTransformer: Function,
    resourceModel: Partial<ResourceModel>
  ): Partial<ResourceModel> {
    let result: any = {};

    for (let key in resourceModel) {
      // check blacklist
      let value = resourceModel[key];

      if (Array.isArray(value)) {
        value = value.map((item) =>
          item instanceof Object
            ? this._serializeData(keyTransformer, item)
            : item
        );
      } else if (value instanceof Object) {
        value = this._serializeData(keyTransformer, value);
      }

      const newKey = keyTransformer(key);
      result[newKey] = value;
    }

    return result as ResourceModel;
  }
}

export default JsonApiParser;
