const app = require("./server");
const request = require("supertest");

describe("Route are working", () => {
  it("should return 404 while getting main page", async () => {
    const response = await request(app).get("/");
    expect(response.status).toEqual(404);
  });

  it("should work and return 400 without params", async () => {
    const response = await request(app).post("/");
    expect(response.status).toEqual(400);
  });

  it("should display plugged property", async () => {
    const response = await request(app)
      .post("/")
      .send({ url: "http://google.com" });
    expect(response.body).toHaveProperty("plugged");
    expect(response.status).toEqual(400);
  });

  it("should be 200 response code", async () => {
    const response = await request(app)
      .post("/")
      .send({ url: "https://www.fasterize.com/fr/" });
    expect(response.status).toEqual(200);
  });

  it("should return all expecting properties", async () => {
    const response = await request(app)
      .post("/")
      .send({ url: "https://www.fasterize.com/fr/" });
    expect(response.body).toHaveProperty("plugged");
    expect(response.body).toHaveProperty("statusCode");
    expect(response.body).toHaveProperty("fstrzFlags");
    expect(response.body).toHaveProperty("cloudfrontStatus");
    expect(response.body).toHaveProperty("cloudfrontPOP");
    expect(response.statusCode).toEqual(200);
  });

  it("should return data correctly", async () => {
    const response = await request(app)
      .post("/")
      .send({ url: "https://www.fasterize.com/fr/" });
    expect(response.statusCode).toEqual(200);
    expect(response.body.statusCode).toBeTruthy();
    expect(response.body.statusCode).toEqual(200);
    expect(response.body.fstrzFlags).toContain("Optimisée");
    expect(response.body.fstrzFlags).toContain("Cachée");
    expect(response.body.cloudfrontStatus).toEqual("MISS");
    expect(response.body.cloudfrontPOP).toEqual("Paris");
  });
});
