'use strict';

module.exports = {
  load() {
    // execute when package loaded
  },

  unload() {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('test_hello');
    },
    'say-hello'() {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('test_hello', 'test_hello:hello');
    },
    'clicked'() {
      Editor.log('Button clicked!');
      //Editor.log(Editor.Project.path);

      let fs = require('fs');
      let path = require('path');

      fs.writeFile(Editor.Project.path + '/newfile.txt', 'Learn Node FS module', function (err) {

        if (err) {
          Editor.log('File is created error.');
        } else {
          Editor.log('File is created successfully.');
        }
      });
    },
  },
};