import JsonApiClient from "./index";
import { RawResponse } from "@atofstryker/json-api-types";
import { AxiosHttpClient } from "@atofstryker/json-api-http-client";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

let jsonApiDogResponse = {
  data: {
    id: "17",
    type: "dog",
    attributes: {
      name: "Doge",
      age: "3",
      color: "brown",
      "cool-doggo-name": "DOGE the cool dog",
      "is-a-good-boy": true,
    },
    links: {
      self: "/api/dog/17/",
    },
    relationships: {
      owner: {
        data: {
          id: "5",
          type: "owner",
        },
        links: {
          related: "/api/dog/12/own/",
          self: "/api/dog/12/relationships/own/",
        },
      },
      legs: {
        data: [
          {
            id: "1",
            type: "leg",
          },
          {
            id: "2",
            type: "leg",
          },
          {
            id: "3",
            type: "leg",
          },
          {
            id: "4",
            type: "leg",
          },
        ],
        links: {
          related: "/api/dog/12/legs/",
          self: "/api/dog/12/relationships/legs/",
        },
      },
    },
  },
};

let jsonApiDogParsed = {
  data: {
    id: "17",
    type: "dog",
    attributes: {
      name: "Doge",
      age: "3",
      color: "brown",
      coolDoggoName: "DOGE the cool dog",
      isAGoodBoy: true,
    },
    links: {
      self: "/api/dog/17/",
    },
    relationships: {
      owner: {
        data: {
          id: "5",
          type: "owner",
        },
        links: {
          related: "/api/dog/12/own/",
          self: "/api/dog/12/relationships/own/",
        },
      },
      legs: {
        data: [
          {
            id: "1",
            type: "leg",
          },
          {
            id: "2",
            type: "leg",
          },
          {
            id: "3",
            type: "leg",
          },
          {
            id: "4",
            type: "leg",
          },
        ],
        links: {
          related: "/api/dog/12/legs/",
          self: "/api/dog/12/relationships/legs/",
        },
      },
    },
  },
};

function buildLegs(id: number, isParsed = false) {
  return {
    id,
    type: "leg",
    attributes: {
      name: `Leg${id}`,
      ...(!isParsed
        ? {
            "is-peg": true,
          }
        : {
            isPeg: true,
          }),
    },
    links: {
      self: `/api/leg/${id}/`,
    },
    relationships: {
      dog: {
        data: {
          id: "17",
          type: "dog",
        },
        links: {
          related: "/api/leg/12/dog/",
          self: "/api/leg/12/relationships/dog/",
        },
      },
    },
  };
}

describe("JSON API Client", () => {
  let axiosMockAdapter: AxiosMockAdapter, jsonApiClient: JsonApiClient;

  beforeEach(() => {
    const httpClient = new AxiosHttpClient<RawResponse>();

    axiosMockAdapter = new AxiosMockAdapter(axios);
    jsonApiClient = new JsonApiClient(httpClient);
  });

  describe("GET testing", () => {
    it("Test parsing of JSON API Responses", async () => {
      axiosMockAdapter.onGet("/dog/17/").reply(200, jsonApiDogResponse);
      const parsedResponseDog = await jsonApiClient.get("dog", "17");
      expect(parsedResponseDog).toEqual(jsonApiDogParsed);
    });

    it("Test parsing of 'includes' JSON API Responses", async () => {
      const jsonApiDogsWithLegs = {
        ...jsonApiDogResponse,
        included: [1, 2, 3, 4].map((num) => buildLegs(num)),
      };

      const jsonApiDogsWithLegsParsed = {
        ...jsonApiDogParsed,
        included: [1, 2, 3, 4].map((num) => buildLegs(num, true)),
      };

      axiosMockAdapter
        .onGet("/dog/17/", { params: { include: "legs" } })
        .reply(200, jsonApiDogsWithLegs);

      const parsedResponseDog = await jsonApiClient.get("dog", "17", {
        query: {
          include: "legs",
        },
      });
      expect(parsedResponseDog).toEqual(jsonApiDogsWithLegsParsed);
    });

    it("Test parsing of 'includes' JSON API Responses with a multi response object", async () => {
      const legsWithDogResponse = {
        data: [...[1, 2, 3, 4].map((num) => buildLegs(num))],
        included: [jsonApiDogResponse.data],
      };

      const legsWithDogParsed = {
        data: [1, 2, 3, 4].map((num) => buildLegs(num, true)),
        included: [jsonApiDogParsed.data],
      };

      axiosMockAdapter
        .onGet("/legs/", { params: { include: "legs" } })
        .reply(200, legsWithDogResponse);

      const parsedResponseDog = await jsonApiClient.get("legs", null, {
        query: {
          include: "legs",
        },
      });
      expect(parsedResponseDog).toEqual(legsWithDogParsed);
    });

    it("Build resource url from link", async () => {
      const jsonApiDogsWithLegs = {
        ...jsonApiDogResponse,
        included: [1, 2, 3, 4].map((num) => buildLegs(num)),
      };

      const jsonApiDogsWithLegsParsed = {
        ...jsonApiDogParsed,
        included: [1, 2, 3, 4].map((num) => buildLegs(num, true)),
      };

      axiosMockAdapter.onGet("/api/dog/17/").reply(200, jsonApiDogsWithLegs);

      const parsedResponseDog = await jsonApiClient.get("cat", "arbitrary", {
        query: {
          include: "legs",
        },
        link: jsonApiDogResponse.data.links.self,
      });
      expect(parsedResponseDog).toEqual(jsonApiDogsWithLegsParsed);
    });
  });

  describe("Create", () => {
    it("creates a raw resource and returns the created raw response", async () => {
      let createADog = {
        id: "17",
        type: "dog",
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          coolDoggoName: "DOGE the cool dog",
          isAGoodBoy: true,
        },
        links: {
          self: "/api/dog/17/",
        },
        relationships: {
          owner: {
            data: {
              id: "5",
              type: "owner",
            },
            links: {
              related: "/api/dog/12/own/",
              self: "/api/dog/12/relationships/own/",
            },
          },
        },
      };

      let createADogResponse = {
        id: "17",
        type: "dog",
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          "cool-doggo-name": "DOGE the cool dog",
          "is-a-good-boy": true,
        },
        links: {
          self: "/api/dog/17/",
        },
        relationships: {
          owner: {
            data: {
              id: "5",
              type: "owner",
            },
            links: {
              related: "/api/dog/12/own/",
              self: "/api/dog/12/relationships/own/",
            },
          },
        },
      };

      axiosMockAdapter.onPost("/dog/17/").reply((config) => {
        expect(config.data).toEqual(
          JSON.stringify({ data: createADogResponse })
        );
        return [201, config.data];
      });

      const parsedResponseDog = await jsonApiClient.create(createADog);
      expect(parsedResponseDog).toEqual(createADog);
    });
  });

  describe("Update", () => {
    it("updates a raw resource and returns the created raw response", async () => {
      let createADog = {
        id: "17",
        type: "dog",
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          coolDoggoName: "DOGE the cool dog",
          isAGoodBoy: true,
        },
        links: {
          self: "/api/dog/17/",
        },
        relationships: {
          owner: {
            data: {
              id: "5",
              type: "owner",
            },
            links: {
              related: "/api/dog/12/own/",
              self: "/api/dog/12/relationships/own/",
            },
          },
        },
      };

      let partialDogUpdate = {
        links: {
          self: "/api/dog/17/",
        },
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          coolDoggoName: "DOGE the cool dog",
          isAGoodBoy: true,
        },
      };

      let createADogResponse = {
        id: "17",
        type: "dog",
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          "cool-doggo-name": "DOGE the cool dog",
          "is-a-good-boy": true,
        },
        links: {
          self: "/api/dog/17/",
        },
        relationships: {
          owner: {
            data: {
              id: "5",
              type: "owner",
            },
            links: {
              related: "/api/dog/12/own/",
              self: "/api/dog/12/relationships/own/",
            },
          },
        },
      };

      axiosMockAdapter.onPatch("api/dog/17/").reply((config) => {
        expect({ data: createADogResponse }).toMatchObject(
          JSON.parse(config.data)
        );
        return [200, { data: createADogResponse }];
      });

      const parsedResponseDog = await jsonApiClient.update(partialDogUpdate);
      expect(parsedResponseDog).toEqual(createADog);
    });

    it("Throws an error when no link is provided", async () => {
      let partialDogUpdate = {
        attributes: {
          name: "Doge",
          age: "3",
          color: "brown",
          coolDoggoName: "DOGE the cool dog",
          isAGoodBoy: true,
        },
      };

      try {
        await jsonApiClient.update(partialDogUpdate);
      } catch (e) {
        expect(e.message).toEqual("No link was provided for updating resource");
      }
    });
  });

  describe("Delete", () => {
    it("Can delete a resource", async () => {
      let partialDog = {
        links: {
          self: "/api/dog/17/",
        },
      };

      axiosMockAdapter.onDelete("api/dog/17/").reply(204);

      const parsedResponseDog = await jsonApiClient.delete(partialDog);
      expect(parsedResponseDog).toEqual(undefined);
    });

    it("Throws an error when no link is provided", async () => {
      let partialDogUpdate = {};

      try {
        await jsonApiClient.delete(partialDogUpdate);
      } catch (e) {
        expect(e.message).toEqual("No link was provided for deleting resource");
      }
    });
  });
});
