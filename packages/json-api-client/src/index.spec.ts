import APIClient, { JsonApiClient } from "./index";

class TestClient extends APIClient {
  async get() {}
  async create() {}
  async update() {}
  async delete() {}
}

describe("Index exports", () => {
  it("signature is defined for APIClient", () => {
    const testClient = new TestClient();

    expect(testClient.get).toBeDefined();
    expect(testClient.create).toBeDefined();
    expect(testClient.update).toBeDefined();
    expect(testClient.delete).toBeDefined();
  });

  it("signature is defined for APIClient", () => {
    const mockHttpClient: any = {};
    const testClient = new JsonApiClient(mockHttpClient);

    expect(testClient.get).toBeDefined();
    expect(testClient.create).toBeDefined();
    expect(testClient.update).toBeDefined();
    expect(testClient.delete).toBeDefined();
  });
});
