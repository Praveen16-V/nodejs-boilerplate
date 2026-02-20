import request from "supertest";
import app from "@/server";
import User from "@/models/User";

describe("Authentication Endpoints", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "TestPass123!",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        email: "test@example.com",
        password: "TestPass123!",
        firstName: "John",
        lastName: "Doe",
      };

      await request(app).post("/api/v1/auth/register").send(userData);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        email: "test@example.com",
        password: "TestPass123!",
        firstName: "John",
        lastName: "Doe",
      });
      await user.save();
    });

    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "TestPass123!",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.token).toBeDefined();
    });

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email or password");
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    let authToken: string;

    beforeEach(async () => {
      const user = new User({
        email: "test@example.com",
        password: "TestPass123!",
        firstName: "John",
        lastName: "Doe",
      });
      await user.save();

      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "TestPass123!",
      });

      authToken = loginResponse.body.data.token;
    });

    it("should return user profile for authenticated user", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("test@example.com");
    });

    it("should return error for unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
