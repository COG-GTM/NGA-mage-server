var sinon = require('sinon')
  , proxyquire = require('proxyquire')
  , mongoose = require('mongoose');

require('chai').should();

describe("form user fields tests", function() {

  afterEach(function() {
    sinon.restore();
  });

  function userForm(id) {
    return {
      _id: id,
      userFields: ['assignee'],
      fields: [{ name: 'text', choices: [] }, { name: 'assignee', choices: [] }]
    };
  }

  function team(id, displayNames) {
    return { _id: id, userIds: displayNames.map(displayName => ({ displayName })) };
  }

  it("should populate user fields for all events with one team query", function(done) {
    const teamA = new mongoose.Types.ObjectId();
    const teamB = new mongoose.Types.ObjectId();
    const teamC = new mongoose.Types.ObjectId();
    const getTeams = sinon.stub().callsFake(function(options, callback) {
      callback(null, [
        team(teamA, ['Carl Jones', 'Ann Smith']),
        team(teamB, ['Ann Smith', 'Bob Brown']),
        team(teamC, ['Zed Young'])
      ]);
    });
    const Form = proxyquire('../../lib/api/form', {
      '../models/team': { getTeams }
    });

    const event1 = { teamIds: [teamA, teamB], forms: [userForm(1)] };
    const event2 = { teamIds: [{ _id: teamC }], forms: [userForm(2)] };
    const event3 = { teamIds: [teamA], forms: [{ _id: 3, userFields: [], fields: [{ name: 'text', choices: [] }] }] };

    Form.populateUserFieldsForEvents([event1, event2, event3], function(err) {
      getTeams.should.have.been.calledOnce;
      getTeams.firstCall.args[0].teamIds.map(String).should.have.members([teamA, teamB, teamC].map(String));
      event1.forms[0].fields[1].choices.map(c => c.title).should.deep.equal(['Bob Brown', 'Carl Jones', 'Ann Smith']);
      event1.forms[0].fields[1].choices.map(c => c.id).should.deep.equal([1, 2, 3]);
      event2.forms[0].fields[1].choices.map(c => c.title).should.deep.equal(['Zed Young']);
      event1.forms[0].fields[0].choices.should.have.length(0);
      event3.forms[0].fields[0].choices.should.have.length(0);
      done(err);
    });
  });

  it("should match populateUserFields for each event", function(done) {
    const teamA = new mongoose.Types.ObjectId();
    const teamB = new mongoose.Types.ObjectId();
    const teams = [team(teamA, ['Carl Jones', 'Ann Smith']), team(teamB, ['Ann Smith', 'Bob Brown'])];
    const getTeams = sinon.stub().callsFake(function(options, callback) {
      const ids = options.teamIds.map(String);
      callback(null, teams.filter(t => ids.includes(String(t._id))));
    });
    const Form = proxyquire('../../lib/api/form', {
      '../models/team': { getTeams }
    });

    const batched = [{ teamIds: [teamA], forms: [userForm(1)] }, { teamIds: [teamA, teamB], forms: [userForm(2)] }];
    const single = JSON.parse(JSON.stringify(batched)).map(e => ({ ...e, teamIds: e.teamIds.map(id => new mongoose.Types.ObjectId(id)) }));

    Form.populateUserFieldsForEvents(batched, function(err) {
      if (err) return done(err);
      let remaining = single.length;
      single.forEach(event => new Form(event).populateUserFields(function(err) {
        if (err) return done(err);
        if (--remaining === 0) {
          JSON.parse(JSON.stringify(batched)).should.deep.equal(JSON.parse(JSON.stringify(single)));
          done();
        }
      }));
    });
  });

  it("should not query teams when no event has user fields", function(done) {
    const getTeams = sinon.stub();
    const Form = proxyquire('../../lib/api/form', {
      '../models/team': { getTeams }
    });

    Form.populateUserFieldsForEvents([{ teamIds: [], forms: [] }], function(err) {
      getTeams.should.not.have.been.called;
      done(err);
    });
  });
});
