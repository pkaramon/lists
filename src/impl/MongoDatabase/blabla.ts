import List from "../../domain/List";
import User from "../../domain/User";
import ListItemFactoryImp from "../../usecases/addListItem/ListItemFactoryImp";

function UserToBSON(user: User) {
  const json = {
    id: user.id.toPrimitive().toString(),
    name: user.name,
    password: user.password,
    birthDate: user.birthDate,
  };
  return json;
}

function ListToBSON(list: List) {
  const listItemsDataObjects = []
  for(const li of list){
    listItemsDataObjects.push(li.toDataObject())

  }

  const json = {
    title: list.title,
    description: list.description,
    listItems: listItemsDataObjects
  };
}

function BSONTolist(bson : any){
  const title = bson.title as string
  const description = bson.description as string
  const listItems = bson.listItems as any[]

  ListItemFactoryImp


}
