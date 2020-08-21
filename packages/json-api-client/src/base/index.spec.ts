import APIClient from "./index";

class TestClient extends APIClient {
  async get() {}
  async create() {}
  async update() {}
  async delete() {}
}

describe("Api Client", () => {
  it("signature is defined", () => {
    const testClient = new TestClient();

    expect(testClient.get).toBeDefined();
    expect(testClient.create).toBeDefined();
    expect(testClient.update).toBeDefined();
    expect(testClient.delete).toBeDefined();
  });
});
