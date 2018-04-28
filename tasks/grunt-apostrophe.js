
const async = require('async');
const exec = require('../lib/exec');
const chain = require('../lib/chain');

module.exports = function (grunt) {

   'use strict';

   grunt.registerMultiTask('apos', 'run tasks for the Apostrophe CMS', function () {
      const done = this.async();
      const options = this.options();
      const tasks = [].concat(options.task || options.tasks).filter(Boolean);
      const run = runner(grunt, options.app);

      if (!options.app) {
         return done(`"app" option must be defined`);
      }

      if (!tasks.length) {
         return done(`"task" or "tasks" options must be defined`);
      }

      getAvailableTasks(options.app)
         .then(validateTasks(tasks))
         .then(() => chain(tasks, run, done))
         .catch(done);

   });

};

function runner (grunt, app) {
   return (task) => {
      grunt.log.debug(`node ${app} ${task}`);
      return exec('node', app, task)
   };
}

function validateTasks (tasks) {
   return (availableTasks) => {
      for (let i = 0, max = tasks.length; i < max; i++) {
         if (!availableTasks.includes(tasks[i])) {
            throw new Error(`Unknown task: "${ tasks[i] }"`);
         }
      }
   };
}

function parseTasks (data) {
   let item;
   const availableTasks = [];
   const tasks = data.split('\n');

   while (item = tasks.shift() || tasks.length) {
      if (/^[a-z\-]+:\w+$/.test(item)) {
         availableTasks.push(item);
      }
   }

   return availableTasks;
}

function getAvailableTasks (app) {
   return exec('node', app, 'help')
      .catch(err => parseTasks(err.message));
}
