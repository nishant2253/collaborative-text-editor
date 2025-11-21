const ioClient = require("socket.io-client");
const http = require("http");
const app = require("../index.js");
const initSocket = require("../socket");

describe("WebSocket Tests", () => {
  let ioServer, client;

  beforeAll((done) => {
    const testServer = http.createServer(app);
    ioServer = initSocket(testServer);

    testServer.listen(6000, () => {
      client = ioClient("http://localhost:6000", { transports: ["websocket"] });
      client.on("connect", done);
    });
  });

  afterAll(() => {
    if (client.connected) client.disconnect();
  });

  test("should join document room", (done) => {
    client.emit("join-document", {
      documentId: "abc123",
      userId: "testUser",
      userName: "Test",
    });

    client.on("user-joined", (payload) => {
      expect(payload.userId).toBe("testUser");
      done();
    });
  });
});
