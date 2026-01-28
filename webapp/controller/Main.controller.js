sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("project1.controller.Main", {
    onInit: function () {
      var oComponent = this.getOwnerComponent();
      this._dataModel = oComponent.getModel("data");
      this._viewModel = oComponent.getModel("view");

      // when data.json is loaded, initialise selected flags
      var that = this;
      this._dataModel.attachRequestCompleted(function () {
        var aCourses = that._dataModel.getProperty("/availableCourses") || [];
        aCourses.forEach(function (c) {
          c.selected = false;
        });
        that._dataModel.setProperty("/availableCourses", aCourses);
        that._recalculate();
      });
    },

    onToggleCourse: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("data");
      if (!oContext) {
        return;
      }

      var bSelected = oContext.getProperty("selected");
      var iCredits = oContext.getProperty("credits") || 0;
      var iTotal = this._viewModel.getProperty("/totalCredits") || 0;

      if (!bSelected && iTotal + iCredits > this._viewModel.getProperty("/maxCredits")) {
        sap.m.MessageToast.show("Maximum " + this._viewModel.getProperty("/maxCredits") + " credit hours only.");
        return;
      }

      oContext.setProperty("selected", !bSelected);
      this._recalculate();
    },

    _recalculate: function () {
      var aCourses = this._dataModel.getProperty("/availableCourses") || [];
      var iMin = this._viewModel.getProperty("/minCredits");
      var iMax = this._viewModel.getProperty("/maxCredits");

      var iTotal = 0;
      var iCount = 0;

      aCourses.forEach(function (c) {
        if (c.selected) {
          iTotal += c.credits || 0;
          iCount++;
        }
      });

      this._viewModel.setProperty("/totalCredits", iTotal);
      this._viewModel.setProperty("/selectedCount", iCount);

      var sStatusText = iTotal + " / " + iMax + " Credits";
      var sStatusState = "Success";
      var bWarningVisible = false;
      var sWarningText = "";

      if (iTotal === 0) {
        sStatusState = "None";
      }

      if (iTotal < iMin) {
        sStatusState = "Warning";
        bWarningVisible = true;
        sWarningText = "You must register at least " + iMin + " credit hours.";
      } else if (iTotal > iMax) {
        sStatusState = "Error";
        bWarningVisible = true;
        sWarningText = "Total credit hours exceeded the maximum of " + iMax + ".";
      }

      this._viewModel.setProperty("/statusText", sStatusText);
      this._viewModel.setProperty("/statusState", sStatusState);
      this._viewModel.setProperty("/warningVisible", bWarningVisible);
      this._viewModel.setProperty("/warningText", sWarningText);
    },

    onRegister: function () {
      var aCourses = this._dataModel.getProperty("/availableCourses") || [];
      var aSelected = aCourses.filter(function (c) {
        return c.selected;
      });

      // Placeholder for backend call
      // Here you would send the selected courses to your backend service.
      /* eslint-disable no-console */
      console.log("Selected courses:", aSelected);
      console.log("Total credits:", this._viewModel.getProperty("/totalCredits"));
      /* eslint-enable no-console */

      sap.m.MessageToast.show("Registration submitted (check console for payload).");
    }
  });
});

