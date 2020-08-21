import { ResourceModel } from "@atofstryker/json-api-types";
import JsonApiParser from "./index";

let jsonApiData: ResourceModel = {
  id: "12",
  type: "user",
  attributes: {
    name: "foo",
  },
  links: {
    self: "/api/user/12/",
  },
  relationships: {
    pantry: {
      data: {
        id: "42",
        type: "pantry",
      },
      links: {
        related: "/api/user/12/pantry/",
        self: "/api/user/12/relationships/pantry/",
      },
    },
    addresses: {
      data: [
        {
          id: "1",
          type: "address",
        },
        {
          id: "2",
          type: "address",
        },
        {
          id: "3",
          type: "address",
        },
      ],
      links: {
        related: "/api/user/12/addresses/",
        self: "/api/user/12/relationships/addresses/",
      },
    },
  },
};

let parsedData: ResourceModel = {
  id: "12",
  type: "user",
  attributes: {
    name: "foo",
  },
  links: {
    self: "/api/user/12/",
  },
  relationships: {
    pantry: {
      data: {
        id: "42",
        type: "pantry",
      },
      links: {
        related: "/api/user/12/pantry/",
        self: "/api/user/12/relationships/pantry/",
      },
    },
    addresses: {
      data: [
        {
          id: "1",
          type: "address",
        },
        {
          id: "2",
          type: "address",
        },
        {
          id: "3",
          type: "address",
        },
      ],
      links: {
        related: "/api/user/12/addresses/",
        self: "/api/user/12/relationships/addresses/",
      },
    },
  },
};

let serializedData: ResourceModel = {
  id: "12",
  type: "user",
  attributes: {
    name: "foo",
  },
  links: {
    self: "/api/user/12/",
  },
  relationships: {
    pantry: {
      data: {
        id: "42",
        type: "pantry",
      },
      links: {
        related: "/api/user/12/pantry/",
        self: "/api/user/12/relationships/pantry/",
      },
    },
    addresses: {
      data: [
        {
          id: "1",
          type: "address",
        },
        {
          id: "2",
          type: "address",
        },
        {
          id: "3",
          type: "address",
        },
      ],
      links: {
        related: "/api/user/12/addresses/",
        self: "/api/user/12/relationships/addresses/",
      },
    },
  },
};

let dashData: ResourceModel = {
  id: "12",
  type: "user",
  attributes: {
    "first-name": "foo",
    deep: {
      "foo-bar": [
        {
          "bar-foo": "foobar",
        },
      ],
    },
  },
  relationships: {
    "dashed-relationship": {
      data: {
        id: "11",
        type: "dashed-relationship",
      },
    },
  },
  links: {
    self: "/api/user/12/",
  },
};

let parsedDashData: ResourceModel = {
  id: "12",
  type: "user",
  attributes: {
    firstName: "foo",
    deep: {
      fooBar: [
        {
          barFoo: "foobar",
        },
      ],
    },
  },
  relationships: {
    dashedRelationship: {
      data: {
        id: "11",
        type: "dashed-relationship",
      },
    },
  },
  links: {
    self: "/api/user/12/",
  },
};

describe("JSON API parser", () => {
  let parser: JsonApiParser;

  beforeAll(() => {
    parser = new JsonApiParser();
  });

  it("parses data", () => {
    let parsed = parser.parse(jsonApiData);
    expect(parsed).toEqual(parsedData);
  });

  it("serializes data", () => {
    let serialized = parser.serialize(parsedData);
    expect(serialized).toEqual(serializedData);
  });

  it("parses with dash attributes", () => {
    let parsed = parser.parse(dashData);
    expect(parsed).toEqual(parsedDashData);
  });

  it("serializes with camelCase attributes", () => {
    let serialized = parser.serialize(parsedDashData);
    expect(serialized).toEqual(dashData);
  });
});
