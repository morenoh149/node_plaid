const chai = require('chai');
chai.use(require('chai-http'));

const { expect } = chai;
const app = require('../src/index');

describe('HTML test', () => {
  before(async () => {});
  after(async () => {});
  it('test GET / request', async () => {
    const res = await chai.request(app).get('/');
    expect(res).to.have.status(200);
  });
});
