const request = require("supertest");
const app = require("../index.js");

describe("AI ROUTES", () => {
  let cookie;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "AI User", email: "ai@example.com", password: "pass1234" });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "ai@example.com", password: "pass1234" });

    cookie = login.headers["set-cookie"];
  });

  it("grammar-check should return mock corrected text", async () => {
    const res = await request(app)
      .post("/api/ai/grammar-check")
      .set("Cookie", cookie)
      .send({ text: "Hello  world" });

    expect(res.statusCode).toBe(200);
    expect(res.body.corrected).toBeDefined();
  });

  it("summarize should return summary", async () => {
    const res = await request(app)
      .post("/api/ai/summarize")
      .set("Cookie", cookie)
      .send({ text: "Sentence one. Sentence two. Sentence three." });

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toBeDefined();
  });
});
