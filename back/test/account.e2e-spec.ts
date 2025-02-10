import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';

describe('Account Module (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let jwtToken: string;
  let createdAccountId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    const randomUsername = 'testuser' + Date.now();
    const password = 'password123';

    await request(httpServer)
      .post('/users/register')
      .send({ username: randomUsername, password })
      .expect(201);

    const loginResponse = await request(httpServer)
      .post('/users/login')
      .send({ username: randomUsername, password })
      .expect(200);

    jwtToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /accounts - should create a new account', async () => {
    const createDto = {
      name: 'TestAccount',
      key: process.env.BITGET_API_KEY,
      secret: process.env.BITGET_API_SECRET,
      passphrase: process.env.BITGET_API_PASSPHRASE,
      exchange: 'bitget'
    };

    const response = await request(httpServer)
      .post('/accounts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toEqual(createDto.name);
    expect(response.body.key).toMatch(/\*/);

    createdAccountId = response.body.id;
  });

  it('GET /accounts - should retrieve all accounts for the authenticated user', async () => {
    const response = await request(httpServer)
      .get('/accounts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const account = response.body.find((acc) => acc.id === createdAccountId);
    expect(account).toBeDefined();
    expect(account.name).toEqual('TestAccount');
  });

  it('GET /accounts/:accountId - should retrieve the specified account by ID', async () => {
    const response = await request(httpServer)
      .get(`/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdAccountId);
    expect(response.body.name).toEqual('TestAccount');
  });

  it('PATCH /accounts/:accountId - should update the specified account', async () => {
    const updateDto = {
      name: 'UpdatedAccount',
      key: 'NEW_API_KEY'
    };

    const response = await request(httpServer)
      .patch(`/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(updateDto)
      .expect(200);

    expect(response.body.name).toEqual(updateDto.name);
    expect(response.body.key).toMatch(/\*/);
  });

  it('DELETE /accounts/:accountId - should delete the specified account', async () => {
    const response = await request(httpServer)
      .delete(`/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdAccountId);

    await request(httpServer)
      .get(`/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });
});
