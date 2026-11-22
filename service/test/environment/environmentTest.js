const
  expect = require('chai').expect,
  path = require('path'),
  proxyquire = require('proxyquire').noPreserveCache();

describe("environment", function() {

  beforeEach("clear environment", function() {
    [
      'MAGE_ADDRESS',
      'MAGE_PORT',
      'MAGE_USER_DIR',
      'MAGE_ICON_DIR',
      'MAGE_ATTACHMENT_DIR',
      'MAGE_TOKEN_EXPIRATION',
      'MAGE_MONGO_URL',
      'MAGE_MONGO_SSL',
      'MAGE_MONGO_USER',
      'MAGE_MONGO_PASSWORD',
      'MAGE_MONGO_AUTH_MECHANISM',
      'MAGE_MONGO_X509_KEY',
      'MAGE_MONGO_X509_CERT',
      'MAGE_MONGO_X509_CA_CERT',
      'MAGE_MONGO_X509_KEY_FILE',
      'MAGE_MONGO_X509_CERT_FILE',
      'MAGE_MONGO_X509_CA_CERT_FILE',
      'MAGE_MONGO_X509_PEM',
      'MAGE_MONGO_X509_PASSWORD',
      'MAGE_MONGO_X509_CA_PEM',
      'MAGE_MONGO_POOL_SIZE',
      'MAGE_MONGO_CONN_TIMEOUT',
      'MAGE_MONGO_CONN_RETRY_DELAY',
      'PORT',
      'ADDRESS'
    ].forEach(key => delete process.env[key]);
  });

  it("provides default values", function() {

    const environment = proxyquire('../../lib/environment/env', {});

    expect(environment).to.have.property('address', '0.0.0.0');
    expect(environment).to.have.property('port', 4242);
    expect(environment).to.have.property('attachmentBaseDirectory', '/var/lib/mage/attachments');
    expect(environment).to.have.property('iconBaseDirectory', '/var/lib/mage/icons');
    expect(environment).to.have.property('userBaseDirectory', '/var/lib/mage/users');
    expect(environment).to.have.property('tokenExpiration', 28800);
    const mongo = environment.mongo;
    expect(mongo).to.have.property('uri', 'mongodb://127.0.0.1:27017/magedb');
    expect(mongo).to.have.property('connectRetryDelay', 5000);
    expect(mongo).to.have.property('connectTimeout', 300000);
    const options = mongo.options;
    expect(options).to.have.property('minPoolSize', 5);
    expect(options).to.have.property('maxPoolSize', 5)
    expect(options).to.not.have.property('auth');
  });

  describe("in default runtime", function() {

    it('loads values from env vars', function() {

      Object.assign(process.env, {
        MAGE_ADDRESS: '64.32.16.8',
        MAGE_PORT: '2424',
        MAGE_USER_DIR: '/test/users',
        MAGE_ICON_DIR: '/test/icons',
        MAGE_ATTACHMENT_DIR: '/test/attachments',
        MAGE_TOKEN_EXPIRATION: '6000',
        MAGE_MONGO_URL: 'mongodb-test://db.test.mage:54545/magedbtest',
        MAGE_MONGO_SSL: 'true',
        MAGE_MONGO_USER: 'mage_test',
        MAGE_MONGO_PASSWORD: 'test_mage',
        MAGE_MONGO_MIN_POOL_SIZE: '87',
        MAGE_MONGO_MAX_POOL_SIZE: '87',
        MAGE_MONGO_CONN_TIMEOUT: '12345',
        MAGE_MONGO_CONN_RETRY_DELAY: '15'
      });
      const environment = proxyquire('../../lib/environment/env', {});

      expect(environment).to.have.property('address', '64.32.16.8');
      expect(environment).to.have.property('port', 2424);
      expect(environment).to.have.property('attachmentBaseDirectory', '/test/attachments');
      expect(environment).to.have.property('iconBaseDirectory', '/test/icons');
      expect(environment).to.have.property('userBaseDirectory', '/test/users');
      expect(environment).to.have.property('tokenExpiration', 6000);
      const mongo = environment.mongo;
      expect(mongo).to.have.property('uri', 'mongodb-test://db.test.mage:54545/magedbtest');
      expect(mongo).to.have.property('connectRetryDelay', 15000);
      expect(mongo).to.have.property('connectTimeout', 12345000);
      const options = mongo.options;
      expect(options).to.have.property('minPoolSize', 87);
      expect(options).to.have.property('maxPoolSize', 87);
      expect(options).to.have.deep.property('auth', { "username": "mage_test", "password": "test_mage" });
      expect(options).to.have.property('authSource', 'admin');
      expect(options).to.have.property('authMechanism', 'SCRAM-SHA-256');
    });

    describe("user/password auth mechanism", function() {

      beforeEach(function() {
        Object.assign(process.env, {
          MAGE_MONGO_USER: 'mage_test',
          MAGE_MONGO_PASSWORD: 'test_mage'
        });
      });

      it("defaults to SCRAM-SHA-256", function() {

        const environment = proxyquire('../../lib/environment/env', {});

        expect(environment.mongo.options).to.have.property('authMechanism', 'SCRAM-SHA-256');
      });

      it("defaults to SCRAM-SHA-256 when the override is blank", function() {

        process.env.MAGE_MONGO_AUTH_MECHANISM = '  ';
        const environment = proxyquire('../../lib/environment/env', {});

        expect(environment.mongo.options).to.have.property('authMechanism', 'SCRAM-SHA-256');
      });

      it("uses SCRAM-SHA-1 when MAGE_MONGO_AUTH_MECHANISM overrides the default", function() {

        process.env.MAGE_MONGO_AUTH_MECHANISM = 'SCRAM-SHA-1';
        const environment = proxyquire('../../lib/environment/env', {});

        expect(environment.mongo.options).to.have.property('authMechanism', 'SCRAM-SHA-1');
        expect(environment.mongo.options).to.have.deep.property('auth', { "username": "mage_test", "password": "test_mage" });
      });

      it("accepts the override regardless of case and surrounding whitespace", function() {

        process.env.MAGE_MONGO_AUTH_MECHANISM = ' scram-sha-1 ';
        const environment = proxyquire('../../lib/environment/env', {});

        expect(environment.mongo.options).to.have.property('authMechanism', 'SCRAM-SHA-1');
      });

      it("rejects an unsupported MAGE_MONGO_AUTH_MECHANISM value", function() {

        for (const invalid of [ 'SCRAM-SHA-512', 'MONGODB-X509', 'PLAIN', 'sha256' ]) {
          process.env.MAGE_MONGO_AUTH_MECHANISM = invalid;
          expect(() => proxyquire('../../lib/environment/env', {}), invalid)
            .to.throw(Error, `Unsupported MAGE_MONGO_AUTH_MECHANISM value '${invalid}'; supported values are SCRAM-SHA-256, SCRAM-SHA-1`);
        }
      });

      it("does not apply to x509 authentication", function() {

        Object.assign(process.env, {
          MAGE_MONGO_AUTH_MECHANISM: 'SCRAM-SHA-1',
          MAGE_MONGO_X509_KEY: 'ENV KEY',
          MAGE_MONGO_X509_CERT: 'ENV CERT',
          MAGE_MONGO_X509_CA_CERT: 'ENV CA CERT'
        });
        const environment = proxyquire('../../lib/environment/env', {});

        expect(environment.mongo.options).to.have.property('authMechanism', 'MONGODB-X509');
      });
    });

    it("prefers x509 authentication when present", function() {

      const keyFile = path.resolve(__dirname, 'test.key.pem');
      const certFile = path.resolve(__dirname, 'test.crt.pem');
      const caCertFile = path.resolve(__dirname, 'test.ca.crt.pem');

      Object.assign(process.env, {
        MAGE_MONGO_URL: 'mongodb-test://db.test.mage:54545/magedbtest',
        MAGE_MONGO_SSL: 'false',
        MAGE_MONGO_USER: 'mage_test',
        MAGE_MONGO_PASSWORD: 'test_key_pass',
        MAGE_MONGO_X509_KEY_FILE: keyFile,
        MAGE_MONGO_X509_CERT_FILE: certFile,
        MAGE_MONGO_X509_CA_CERT_FILE: caCertFile
      });

      const env = proxyquire('../../lib/environment/env', {});
      const mongo = env.mongo;
      const options = mongo.options;

      expect(mongo).to.have.property('uri', 'mongodb-test://db.test.mage:54545/magedbtest');
      expect(options).to.have.property('ca').that.is.instanceOf(Buffer);
      expect(options.ca.toString()).to.equal('TEST CA CERTIFICATE');
      expect(options).to.have.property('key').that.is.instanceOf(Buffer);
      expect(options.key.toString()).to.equal('TEST PRIVATE KEY');
      expect(options).to.have.property('cert').that.is.instanceOf(Buffer);
      expect(options.cert.toString()).to.equal('TEST PUBLIC CERTIFICATE');
      expect(options).to.have.property('passphrase', 'test_key_pass');
      expect(options).to.have.property('authSource', '$external');
      expect(options).to.have.deep.property('authMechanism', 'MONGODB-X509');
      expect(options).to.not.have.property('user');
    });

    it("uses x509 environment values when present", function() {

      const keyFile = path.resolve(__dirname, 'test.key.pem');
      const certFile = path.resolve(__dirname, 'test.crt.pem');
      const caCertFile = path.resolve(__dirname, 'test.ca.crt.pem');

      Object.assign(process.env, {
        MAGE_MONGO_URL: 'mongodb-test://db.test.mage:54545/magedbtest',
        MAGE_MONGO_SSL: 'false',
        MAGE_MONGO_USER: 'mage_test',
        MAGE_MONGO_PASSWORD: 'test_key_pass',
        MAGE_MONGO_X509_KEY: 'ENV KEY',
        MAGE_MONGO_X509_CERT: 'ENV CERT',
        MAGE_MONGO_X509_CA_CERT: 'ENV CA CERT',
        MAGE_MONGO_X509_KEY_FILE: keyFile,
        MAGE_MONGO_X509_CERT_FILE: certFile,
        MAGE_MONGO_X509_CA_CERT_FILE: caCertFile
      });

      const env = proxyquire('../../lib/environment/env', {});
      const mongo = env.mongo;
      const options = mongo.options;

      expect(mongo).to.have.property('uri', 'mongodb-test://db.test.mage:54545/magedbtest');
      expect(options).to.have.property('ca').that.is.instanceOf(Buffer);
      expect(options.ca.toString()).to.equal('ENV CA CERT');
      expect(options).to.have.property('key').that.is.instanceOf(Buffer);
      expect(options.key.toString()).to.equal('ENV KEY');
      expect(options).to.have.property('cert').that.is.instanceOf(Buffer);
      expect(options.cert.toString()).to.equal('ENV CERT');
      expect(options).to.have.property('passphrase', 'test_key_pass');
      expect(options).to.have.property('authSource', '$external');
      expect(options).to.have.deep.property('authMechanism', 'MONGODB-X509');
      expect(options).to.not.have.property('user');
    });
  });
});
