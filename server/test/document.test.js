const request = require("supertest");
const app = require("../index.js");
const User = require("../models/User");

describe("DOCUMENT API TESTS", () => {
  let cookie;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Doc User", email: "doc@example.com", password: "123456" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "doc@example.com", password: "123456" });

    cookie = login.headers["set-cookie"];
  });

  it("should create a document", async () => {
    const res = await request(app)
      .post("/api/documents")
      .set("Cookie", cookie)
      .send({ title: "My Doc" });

    expect(res.statusCode).toBe(201);
    expect(res.body.document.title).toBe("My Doc");
  });

  it("should fetch a list of documents", async () => {
    await request(app)
      .post("/api/documents")
      .set("Cookie", cookie)
      .send({ title: "Doc 1" });

    const res = await request(app).get("/api/documents").set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.owned.length).toBe(1);
  });

  it("should update a document", async () => {
    const doc = await request(app)
      .post("/api/documents")
      .set("Cookie", cookie)
      .send({ title: "To Update" });

    const res = await request(app)
      .put(`/api/documents/${doc.body.document._id}`)
      .set("Cookie", cookie)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.document.title).toBe("Updated Title");
  });

  it("should delete a document", async () => {
    const doc = await request(app)
      .post("/api/documents")
      .set("Cookie", cookie)
      .send({ title: "To Delete" });

    const res = await request(app)
      .delete(`/api/documents/${doc.body.document._id}`)
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted");
  });
});
