const request = require('supertest');

// Use manual mock for DB to avoid needing real MySQL during tests
jest.mock('../config/db', () => require('../__mocks__/config/db'));
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const app = require('../server');
const crypto = require('crypto');

describe('Auth integration (cookie-based)', () => {
  const random = () => crypto.randomBytes(6).toString('hex');
  let email = `test+${random()}@example.com`;
  const password = 'TestPass123!';

  test('register -> login -> me returns user and sets cookie', async () => {
    // Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, phone: '08123456789', password })
      .set('Accept', 'application/json');

    expect([200,201,409]).toContain(registerRes.status); // allow existing or created

    // Login using agent to persist cookies
    const agent = request.agent(app);

    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    expect(loginRes.status).toBeGreaterThanOrEqual(200);
    expect(loginRes.status).toBeLessThan(400);
    // Check that server set cookie 'token'
    const cookies = loginRes.headers['set-cookie'] || [];
    const hasTokenCookie = cookies.some(c => c.startsWith('token='));
    expect(hasTokenCookie).toBe(true);

    // Call /api/auth/me with the agent (cookie attached)
    const meRes = await agent.get('/api/auth/me').set('Accept', 'application/json');
    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty('user');
    expect(meRes.body.user).toHaveProperty('email', email);
  }, 20000);
});
