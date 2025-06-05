const request = require('supertest');
const app = require('../index'); // Assuming index.js exports the app

describe('API Startup', () => {
  let server;

  beforeAll((done) => {
    // It's possible app.listen is already called in index.js
    // If so, supertest might handle it, or we might need to adjust index.js
    // For now, let's assume supertest can attach to the already listening app
    // or that index.js doesn't immediately listen if it's required as a module.
    // If index.js directly calls app.listen, this might be problematic.
    // A better pattern is app.js exports app, server.js imports app and listens.
    // For this test, we'll rely on supertest's ability to handle an exported app object.
    // If 'app' is the express app instance, supertest(app) should work.
    // If index.js starts the server, we might not need to do anything here,
    // or we might need to ensure it only starts once.
    // Let's try without manually starting/stopping the server here first.
    // Supertest typically doesn't require the server to be manually started with .listen()
    // when you pass the app object directly to it.
    done();
  });

  afterAll((done) => {
    // If index.js starts a server, we might need a way to close it.
    // This is often tricky if index.js isn't designed for testability.
    // e.g. if (server && server.close) { server.close(done); } else { done(); }
    // For now, if app is just the express app, supertest handles teardown.
    done();
  });

  it('should respond with 200 and welcome message at /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Backend is running ✅');
  });
});
