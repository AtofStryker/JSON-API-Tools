export default abstract class ApiClient {
  abstract async get(...args: any): Promise<any>;

  abstract async create(resource: any): Promise<any>;

  abstract async update(resource: any): Promise<any>;

  abstract async delete(resource: any): Promise<void>;
}
