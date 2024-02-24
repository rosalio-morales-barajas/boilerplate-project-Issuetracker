'use strict';

//Install and set up mongodb and mongoose
let mongodb = require('mongodb');
const mongoose = require('mongoose');
//const mySecret = process.env['MONGO_URI']


module.exports = function (app) {

  //Connect mongoose to mongodb database
  mongoose.connect("mongodb+srv://Rosalio:Rosalio791975@rosaliomorales.btcjciy.mongodb.net/?retryWrites=true&w=majority&appName=RosalioMorales",
  { useNewUrlParser: true, useUnifiedTopology: true });

  //Create a schema and a Model for data going into mongodb database 
  const { Schema } = mongoose;
  const issuesSchema = new Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    created_by: {type: String, required: true},
    assigned_to: String,
    open: {type: Boolean, required: true},
    status_text: String,
    project: String
    });
  const Issue = mongoose.model('Issue', issuesSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      console.log('get request query: %j', req.query);
      let filterObject = Object.assign(req.query, {project: req.params.project});
      Issue.find(filterObject, function(err, projectsFound_1) {
        if(err){
          console.log(err);
        } else {
          console.log('projectsFound_1 in get request: ', projectsFound_1);
          res.json(projectsFound_1);
        };
      });
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      console.log('POST request project name: ', req.params.project);
      //Check if some required fields are missing
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        console.log('required field(s) missing');
        return res.json({error: 'required field(s) missing'});
      };
      //Create issue and save in database
      const createAndSaveIssue = function(done) {
        let newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          open: true,
          status_text: req.body.status_text || '',
          project: project
        })
        newIssue.save(function(err, savedIssue) {
          console.log('savedIssue: ', savedIssue);
          if(err){
            return console.error(err);
          }else{
            //Return (i.e show) object created to the client
            res.json(savedIssue);
            done(null,savedIssue);
          };
        });
      };
      createAndSaveIssue(() => {});
    })
    

    .put(function (req, res){
      //Has the user given us the id of the issue he wants to update?
      console.log("PUT request body: %j", req.body);
      if (!req.body._id) {
        console.log('required field(s) missing');
        return res.json({ error: 'missing _id' });
      };
      //set query: (i.e what will be searched for) in findOneAndUpdate below
      const query = { "_id": req.body._id };
      //set update: Set the fields to updated and the values to be updated to in findOneAndUpdate
      let updateObject_1 = {}
      Object.keys(req.body).filter(function (key) { 
        if (req.body[key] != '') {updateObject_1[key] = req.body[key]};
      });      
      let updateObject_2 = Object.assign({updated_on: new Date()}, updateObject_1);
      console.log('Object.keys(updateObject_2).length: ',Object.keys(updateObject_2).length);      
      if (Object.keys(updateObject_2).length < 3) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      };      
      console.log("updateObject_2: %j", updateObject_2);      
      const update = {
        "$set": updateObject_2
      };
      //set options: set whether you want to return the updated or the original document
      const options = { returnNewDocument: true };
      //execute findOneAndUpdate
      return Issue.findOneAndUpdate(query, update, options)
        .then(updatedDocument => {
          if(updatedDocument) {
            console.log(`Successfully updated document`)
            return res.json({result: 'successfully updated', '_id': req.body._id });
          } else {
            console.log("error: could not update, No document matches the query")
            return res.json({ error: 'could not update', '_id': req.body._id });
          }
          return updatedDocument
        })
        .catch(function (err) {
          console.error(`Failed to find and update document: ${err}`);         
          return res.json({ error: 'could not update', '_id': req.body._id });
        })
    })
    

    .delete(function (req, res){
      
      //Has the user given us the id of the issue he wants to update?
      console.log("DELETE request body: %j", req.body);
      if (!req.body._id) {
        console.log('missing _id');
        return res.json({ error: 'missing _id' });
      };

      //set query: (i.e what will be searched for) in findOneAndDelete below
      const query = { "_id": req.body._id };
      // Sort the documents in order of descending quantity before
      // deleting the first one.
      const options = {
        "sort": { "quantity": -1 }
      }
      return Issue.findOneAndDelete(query, options)
        .then(deletedDocument => {
          if(deletedDocument) {
            console.log(`Successfully deleted document that had the form: `, deletedDocument)
            return res.json({result: 'successfully deleted', '_id': req.body._id });
          } else {
            console.log("error: could not delete, No document matches the query")
            return res.json({ error: 'could not delete', '_id': req.body._id });
          }
          return deletedDocument
        })
        .catch(function (err) {
          console.error(`Failed to find and delete document: ${err}`);         
          return res.json({ error: 'could not delete', '_id': req.body._id });
        })
      
    });
    
};
