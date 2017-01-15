import { method, asyncMethod } from './index';

describe('method', function () {
  it('is a function', function () {
    expect(method).to.be.a('function');
  });
  it('has access to DOM', function () {
    expect(document).to.exist();
  });
  it('should return true for params passed that are greater than 0', function () {
    expect(method(1)).to.be.true();
  });
  it('shows async flows', function () {
    expect(asyncMethod()).to.eventually.equal(42);
  });
});

