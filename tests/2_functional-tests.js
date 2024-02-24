const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let deleteID;
let id_test_project_1;

suite('Functional Tests', function() {

  // #1
  test('#1 Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/Test_project_1')
      .send({
        issue_title: 'Test title 1',
        issue_text: 'Test text 1',
        created_by: 'Test author 1',
        assigned_to: 'Test assignee 1',
        open: true,
        status_text: 'Unread issue 1',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test title 1');
        assert.equal(res.body.issue_text, 'Test text 1');
        assert.equal(res.body.created_by, 'Test author 1');
        assert.equal(res.body.assigned_to, 'Test assignee 1');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, 'Unread issue 1');
        assert.equal(res.body.project, 'Test_project_1');
        deleteID = res.body._id;
        id_test_project_1 = res.body._id;
        done();
      });
  });

  // #2
  test('#2 Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/Test_project_2')
      .send({
        issue_title: 'Test title 2',
        issue_text: 'Test text 2',
        created_by: 'Test author 2',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test title 2');
        assert.equal(res.body.issue_text, 'Test text 2');
        assert.equal(res.body.created_by, 'Test author 2');
        done();
      });
  });

  // #3
  test('#3 Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/Test_project_3')
      .send({
        issue_title: '',
        issue_text: '',
        created_by: '',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // #4 
  test('#4 View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/Test_project_1')
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        done();
      });
  });

  // #5
  test('#5 View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/Test_project_1')
      .query({
        created_by:"Test author 1",
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        done();
      });
  });

  // #6
  test('#6 View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/Test_project_1')
      .query({
        created_by:"Test author 1",
        assigned_to:"Test assignee 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        done();
      });
  });

  // #7
  test('#7 Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/Test_project_1')
      .send({
        _id:id_test_project_1,
        issue_text:"Test text 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, id_test_project_1);
        done();
      });
  });

  // #8
  test('#8 Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/Test_project_1')
      .send({
        _id: id_test_project_1,
        issue_title:"Test title 1",
        issue_text:"Test text 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, id_test_project_1);
        done();
      });
  });

  // #9
  test('#9 Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/Test_project_1')
      .send({
        issue_title:"Test title 1",
        issue_text:"Test text 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // #10
  test('#10 Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/Test_project_1')
      .send({
        _id: id_test_project_1
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // #11
  test('#11 Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/Test_project_1')
      .send({
        _id: "61",
        issue_title:"Test title 1",
        issue_text:"Test text 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  // #12
  test('#12 Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/Test_project_1')
      .send({
        _id: deleteID,
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  // #13
  test('#13 Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/Test_project_1')
      .send({
        _id: '4378',
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  // #14
  test('#14 Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/Test_project_1')
      .send({
        issue_text:"Test text 1"
      })
      .end(function (err, res) {
        console.log(res.body[0])
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  after(function() {
    chai.request(server)
      .get('/')
  });

});
