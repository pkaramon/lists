import IdConverter from "../../dataAccess/IdConverter";
import ListDb from "../../dataAccess/ListDb";
import NotFoundError from "../../dataAccess/NotFoundError";
import Id from "../../domain/Id";
import List from "../../domain/List";
import ListItemGateway from "../../domain/ListItemGateway";
import MongoDb, { mongoDbErrorsGuard } from "./MongoDb";

interface ListData {
  _id: string;
  title: string;
  description: string;
  authorId: string;
  listItems: any[];
}

export default class MongoListDb extends MongoDb<ListData> implements ListDb {
  constructor(
    data: {
      uri: string;
      collectionName: string;
      databaseName: string;
    },
    private utils: {
      listIdConverter: IdConverter;
      userIdConverter: IdConverter;
      listItemGateway: ListItemGateway;
    }
  ) {
    super(data);
  }

  @mongoDbErrorsGuard
  async deleteById(id: Id): Promise<void> {
    const collection = await this.getCollection();
    const record = await collection.deleteOne({ _id: id.toString() });
    const nDeleted = record.result.n ?? 0;
    if (nDeleted === 0) throw new NotFoundError();
  }

  @mongoDbErrorsGuard
  async save(list: List): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: list.id.toString() },
      { $set: this.fromListToListData(list) },
      { upsert: true }
    );
  }

  @mongoDbErrorsGuard
  async getById(id: Id): Promise<List> {
    const listData = await this.findOne({ _id: id.toString() });
    return this.fromListDataToList(listData);
  }

  @mongoDbErrorsGuard
  async getListsMadeBy(authorId: Id): Promise<List[]> {
    const collection = await this.getCollection();
    const listsData = await collection
      .find({ authorId: authorId.toString() })
      .toArray();
    return listsData.map((ld) => this.fromListDataToList(ld));
  }

  private fromListToListData(list: List) {
    return {
      _id: list.id.toString(),
      authorId: list.authorId.toString(),
      description: list.description,
      title: list.title,
      listItems: this.getListItemsData(list),
    };
  }

  private getListItemsData(list: List) {
    const listItemsData = [];
    for (const li of list) {
      listItemsData.push(this.utils.listItemGateway.fromObjectToData(li));
    }
    return listItemsData;
  }

  private fromListDataToList(listData: ListData) {
    const list = new List({
      ...listData,
      id: this.utils.listIdConverter.convert(listData._id),
      authorId: this.utils.userIdConverter.convert(listData.authorId),
    });

    for (const liData of listData.listItems) {
      list.addListItem(this.utils.listItemGateway.fromDataToObject(liData));
    }

    return list;
  }
}
