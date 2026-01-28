sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("project1.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      // load main JSON data (student + courses)
      var oModel = new JSONModel();
      oModel.loadData("model/data.json");
      this.setModel(oModel, "data");

      // view model for UI state
      var oViewModel = new JSONModel({
        minCredits: 9,
        maxCredits: 21,
        totalCredits: 0,
        selectedCount: 0,
        statusText: "0 / 21 Credits",
        statusState: "None",
        warningVisible: false,
        warningText: ""
      });
      this.setModel(oViewModel, "view");
    }
  });
});

