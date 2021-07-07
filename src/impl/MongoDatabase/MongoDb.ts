import mongo from "mongodb";
import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";

export default class MongoDb<Data> {
  private client?: mongo.MongoClient;

  constructor(
    protected data: {
      uri: string;
      databaseName: string;
      collectionName: string;
    }
  ) {}

  @mongoDbErrorsGuard
  public async TESTS_ONLY_clear() {
    const client = await this.getClient();
    await client.db(this.data.databaseName).dropDatabase();
  }

  protected async findOne(filter: mongo.FilterQuery<Data>) {
    const collection = await this.getCollection();
    const documentData = await collection.findOne(filter);
    if (documentData === null) throw new NotFoundError();
    return documentData;
  }

  protected async getCollection() {
    const client = await this.getClient();
    const db = client.db(this.data.databaseName);
    return db.collection<Data>(this.data.collectionName);
  }

  private async getClient() {
    if (this.client === undefined) {
      return mongo.connect(this.data.uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
    } else {
      return this.client;
    }
  }
}

export function mongoDbErrorsGuard(
  _: any,
  __: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value! as Function;
  descriptor.value = async function () {
    try {
      return await originalMethod.apply(this, arguments);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      else throw new DatabaseError();
    }
  };
}
