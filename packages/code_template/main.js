'use strict';

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
      Editor.Panel.open('code_template');
    },
    'say-hello' () {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('code_template', 'code_template:hello');
    },
    'clicked' () {
      Editor.log('Button clicked!');
    }
  },
};