import AbstractHttpClient from "./index";

class HttpClientImpl extends AbstractHttpClient<any> {
  async _makeRequest() {}
}

describe("HTTP Client", function () {
  let httpClient: HttpClientImpl;

  beforeEach(function () {
    httpClient = new HttpClientImpl();
  });
  describe("#buildUrl", function () {
    it("returns the canonical link for a type and id", function () {
      expect(httpClient.buildUrl("foo", "2")).toEqual("/foo/2/");
      expect(httpClient.buildUrl("4", "2")).toEqual("/4/2/");
      expect(httpClient.buildUrl("foo", "0")).toEqual("/foo/0/");
    });

    it("returns the canonical link for a type", function () {
      expect(httpClient.buildUrl("foo")).toEqual("/foo/");
      expect(httpClient.buildUrl("4")).toEqual("/4/");
    });

    it("returns the canonical link with a prefix", function () {
      let httpClient = new HttpClientImpl({ urlPrefix: "/api" });
      expect(httpClient.buildUrl("foo", "2")).toEqual("/api/foo/2/");
      expect(httpClient.buildUrl("foo")).toEqual("/api/foo/");
    });
  });

  describe("#request", function () {
    it("populates defaults", async () => {
      httpClient._http = jest.fn();

      await httpClient.request("test-url");

      expect(httpClient._http).toHaveBeenCalledTimes(1);
      expect(httpClient._http).toHaveBeenCalledWith(
        "GET",
        "test-url",
        undefined,
        {},
        false
      );
    });

    it("populates additional fields when passed", async () => {
      httpClient._http = jest.fn();

      await httpClient.request("test-url", {
        method: "POST",
        headers: {
          "header-1": "one",
        },
        data: {
          "header-1": "one",
        },
      });

      expect(httpClient._http).toHaveBeenCalledTimes(1);
      expect(httpClient._http).toHaveBeenCalledWith(
        "POST",
        "test-url",
        {
          "header-1": "one",
        },
        {
          "header-1": "one",
        },
        false
      );
    });
  });

  describe("#serializeRequests", () => {
    const path1 = "api/user/42/";
    const path2 = "api/offer/9000/";

    it("parallel requests do not start and start after previous finishes when `serializeRequests = true`", async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      httpClient._makeRequest = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}));

      // Turn on `serializeRequests` and then make two parallel requests
      httpClient.serializeRequests = true;
      httpClient.get(path1);
      httpClient.get(path2);

      // Tick microtask queue
      await new Promise(setImmediate);
      expect(httpClient._makeRequest).toHaveBeenCalledTimes(1);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1),
        })
      );
    });

    it("parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started", async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      httpClient._makeRequest = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}));

      // Turn on `serializeRequests` after making the first request
      httpClient.get(path1);
      httpClient.serializeRequests = true;
      httpClient.get(path2);

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(1);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1),
        })
      );
    });

    it("sequential requests start after previous finishes when `serializeRequests = true`", async () => {
      const respondToRequest: Function[] = [];
      httpClient._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve);
        });
      });

      httpClient.serializeRequests = true;
      const fetch1 = httpClient.get(path1);
      const fetch2 = httpClient.get(path2);

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(1);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1),
        })
      );

      const payload = { foo: "bar", fiz: { biz: "buz" } };

      // resolve the first request
      respondToRequest[0](payload);

      await fetch1;

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(2);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: expect.stringContaining(path2),
        })
      );

      const payload2 = { foo2: "bar", fiz2: { biz: "buz" } };

      // resolve the second request
      respondToRequest[1](payload2);

      await fetch2;
    });

    it("parallel requests are restored after `serializeRequests` is toggled back", async () => {
      const respondToRequest: Function[] = [];
      httpClient._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve);
        });
      });

      // Turn on `serializeRequests` and make some requests
      httpClient.serializeRequests = true;
      const fetch1 = httpClient.get(path1);
      const fetch2 = httpClient.get(path2);

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(1);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1),
        })
      );

      // resolve the first request
      respondToRequest[0]();

      await fetch1;

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(2);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: expect.stringContaining(path2),
        })
      );

      // resolve the second request
      respondToRequest[1]();

      await fetch2;

      // Now try to make requests in parallel
      httpClient.serializeRequests = false;
      httpClient.get(path1);
      httpClient.get(path2);

      // Tick microtask queue
      await new Promise(setImmediate);

      expect(httpClient._makeRequest).toHaveBeenCalledTimes(4);
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          url: expect.stringContaining(path1),
        })
      );
      expect(httpClient._makeRequest).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          url: expect.stringContaining(path2),
        })
      );

      // resolve the fourth and third request for extra validation. They should both exist and the resolve order does not matter
      respondToRequest[3]();
      respondToRequest[2]();
    });
  });
});
