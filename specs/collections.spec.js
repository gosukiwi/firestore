const { LocalStorage } = require("node-localstorage");
const {
  collection,
  addDoc,
  getDocs,
  getDoc,
  where,
  orderBy,
  limit,
  skip,
  deleteDocs,
  deleteDoc,
  updateDocs,
  updateDoc,
} = require("../lib/index");

beforeAll(() => {
  global.localStorage = new LocalStorage("./scratch");
});

beforeEach(() => {
  global.localStorage.clear();
});

test("addDoc", () => {
  const col = collection("people");
  const doc = addDoc(col, { name: "Mike" });
  expect(doc.name).toBe("Mike");
});

test("getDocs", () => {
  const col = collection("people");
  addDoc(col, { name: "Mike" });
  const docs = getDocs(col);
  expect(docs[0].name).toBe("Mike");
});

test("getDoc", () => {
  const col = collection("people");
  addDoc(col, { name: "Mike" });
  addDoc(col, { name: "John" });

  const doc = getDoc(col, where("name", "==", "Mike"));
  expect(doc.name).toBe("Mike");
});

describe("queries", () => {
  test("getDocs + where", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike" });
    addDoc(col, { name: "John" });

    const docs = getDocs(col, where("name", "==", "Mike"));
    expect(docs[0].name).toBe("Mike");

    const docs2 = getDocs(col, where("name", "==", "John"));
    expect(docs2[0].name).toBe("John");
  });

  test("getDocs + multiple where", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike", surname: "Small", age: 18 });
    addDoc(col, { name: "Mike", surname: "Big", age: 39 });

    const docs = getDocs(
      col,
      where("name", "==", "Mike"),
      where("age", ">", 18)
    );
    expect(docs[0].surname).toBe("Big");
  });

  test("in", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike" });
    addDoc(col, { name: "John" });
    addDoc(col, { name: "Pfteven" });

    const docs = getDocs(col, where("name", "in", ["Mike", "John"]));

    expect(docs.length).toBe(2);
    expect(docs[0].name).toBe("Mike");
    expect(docs[1].name).toBe("John");
  });

  test("not-in", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike" });
    addDoc(col, { name: "John" });
    addDoc(col, { name: "Pfteven" });

    const docs = getDocs(col, where("name", "not-in", ["Mike", "John"]));

    expect(docs.length).toBe(1);
    expect(docs[0].name).toBe("Pfteven");
  });

  test("array-contains", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike", likes: ["potatoes", "hunger"] });
    addDoc(col, { name: "John", likes: ["coffee", "potatoes"] });
    addDoc(col, { name: "Pfteven", likes: ["dogs"] });

    const docs = getDocs(
      col,
      where("likes", "array-contains", ["potatoes", "hunger"])
    );

    expect(docs.length).toBe(1);
    expect(docs[0].name).toBe("Mike");
  });

  test("array-contains-any", () => {
    const col = collection("people");
    addDoc(col, { name: "Mike", likes: ["potatoes", "hunger"] });
    addDoc(col, { name: "John", likes: ["coffee", "potatoes"] });
    addDoc(col, { name: "Pfteven", likes: ["dogs"] });

    const docs = getDocs(
      col,
      where("likes", "array-contains-any", ["potatoes", "hunger"])
    );

    expect(docs.length).toBe(2);
    expect(docs[0].name).toBe("Mike");
    expect(docs[1].name).toBe("John");
  });

  test("getDocs + order", () => {
    const col = collection("people");
    addDoc(col, { name: "Abel" });
    addDoc(col, { name: "Zynosky" });

    let docs = getDocs(col, orderBy("name", "desc"));
    expect(docs[0].name).toBe("Zynosky");
    expect(docs[1].name).toBe("Abel");

    docs = getDocs(col, orderBy("name", "asc"));
    expect(docs[0].name).toBe("Abel");
    expect(docs[1].name).toBe("Zynosky");
  });

  test("getDocs + numeric order", () => {
    const col = collection("people");
    addDoc(col, { name: "Abel", age: 40 });
    addDoc(col, { name: "Zynosky", age: 30 });

    const docs = getDocs(col, orderBy("age", "desc"));
    expect(docs[0].name).toBe("Abel");
    expect(docs[1].name).toBe("Zynosky");
  });

  test("limit", () => {
    const col = collection("people");
    addDoc(col, { name: "Abel", age: 40 });
    addDoc(col, { name: "Zynosky", age: 30 });
    addDoc(col, { name: "Pepe", age: 30 });

    const docs = getDocs(col, limit(2));
    expect(docs[0].name).toBe("Abel");
    expect(docs[1].name).toBe("Zynosky");
  });

  test("skip", () => {
    const col = collection("people");
    addDoc(col, { name: "Abel", age: 40 });
    addDoc(col, { name: "Zynosky", age: 30 });
    addDoc(col, { name: "Pepe", age: 30 });

    const docs = getDocs(col, skip(1));
    expect(docs[0].name).toBe("Zynosky");
    expect(docs[1].name).toBe("Pepe");
  });
});

test("deleteDocs", () => {
  const col = collection("people");
  addDoc(col, { name: "Abel", age: 40 });
  addDoc(col, { name: "Zynosky", age: 30 });
  addDoc(col, { name: "Pepe", age: 30 });

  deleteDocs(col, where("name", "==", "Zynosky"));
  const docs = getDocs(col);
  expect(docs[0].name).toBe("Abel");
  expect(docs[1].name).toBe("Pepe");
});

test("deleteDoc", () => {
  const col = collection("people");
  addDoc(col, { name: "Abel", age: 40 });
  addDoc(col, { name: "Zynosky", age: 30 });
  addDoc(col, { name: "Pepe", age: 30 });

  deleteDoc(col);
  const docs = getDocs(col);
  expect(docs[0].name).toBe("Zynosky");
  expect(docs[1].name).toBe("Pepe");
});

test("updateDocs", () => {
  const col = collection("people");
  addDoc(col, { name: "Abel", age: 40 });

  updateDocs(col, where("name", "==", "Abel"), { age: 22 });
  const docs = getDocs(col);
  expect(docs[0].age).toBe(22);
});

test("updateDoc", () => {
  const col = collection("people");
  addDoc(col, { name: "Abel", age: 40 });
  addDoc(col, { name: "Betty", age: 60 });

  updateDoc(col, { age: 22 });
  const docs = getDocs(col);
  expect(docs[0].age).toBe(22);
  expect(docs[1].age).toBe(60);
});
