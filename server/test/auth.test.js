const request = require("supertest");
const app = require("../index.js"); // ensure index.js exports the app when testing
const User = require("../models/User");

describe("AUTH API TESTS", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");

    const user = await User.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
  });

  it("should login the registered user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "login@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("login@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return current user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Me User",
      email: "me@example.com",
      password: "password123",
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "me@example.com",
      password: "password123",
    });

    const cookie = login.headers["set-cookie"];

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });
});
