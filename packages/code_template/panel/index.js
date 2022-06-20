/**
 * 
 *  创建代码模板，设置名称，选择路径
 * 
 */
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h2>code_template</h2>
    <hr />
    <div>create ui-form code<br /><br />
    <ui-input id="ui_form_label"></ui-input><br /><br />
    <ui-button id="ui_form_btn">select a path</ui-button>
    </div>
    <hr />
  `,

  // element and variable binding
  $: {
    ui_form_btn: '#ui_form_btn',
    ui_form_label: '#ui_form_label',
  },


  // form 代码模板
  form_template: `
  import { FormEffect } from "../../define/GlobalEnum";
  import FormManager from "../../manager/FormManager";
  import SampleForm from "./SampleForm";

  const { ccclass, property } = cc._decorator;

  @ccclass
  export default class $name extends SampleForm {
      /**
       * 绑定内容
       */

      ///////////////////////////////////
      /**
       * 声明内容
       */

      ///////////////////////////////////

      protected lateLoad() {

      }

      protected lateClose() {
          FormManager.ins.closeForm(null, FormEffect.RightInOut);
      }

  }
  `,
  //

  // method executed when template and styles are successfully loaded and initialized
  ready() {

    this.$ui_form_btn.addEventListener('confirm', () => {

      this.createTemplateFile(this.$ui_form_label.value, this.form_template);

    }, this);


  },

  async createTemplateFile(fileName, template) {

    if (fileName == "") {
      Editor.log('File Name is empty.');
      return;
    }

    let path = Editor.Dialog.openFile({
      defaultPath: Editor.Project.path + "\\assets\\script",
      properties: ["openDirectory"]
    })
    if (path == -1) {
      Editor.log('select is cancel');
      return;
    }

    let file = `${path}\\${fileName}.ts`;

    file = file.replace(/\\/g, "/");

    file = file.replace(/.*\/assets/, "db://assets");

    template = template.replace("$className", fileName);

    Editor.assetdb.create(file,

      template

      , function (err, results) {
        // results.forEach(function (result) {
        //   // result.uuid
        //   // result.parentUuid
        //   // result.url
        //   // result.path
        //   // result.type
        // });
        if (err) {
          Editor.log('File is created error.', file);
        } else {
          Editor.log('File is created successfully.', file);
        }
      });
  },

  // register your ipc messages here
  messages: {
    'code_template:hello'(event) {
      this.$label.innerText = 'Hello!';
    }
  }
});