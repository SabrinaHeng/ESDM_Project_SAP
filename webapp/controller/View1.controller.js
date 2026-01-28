sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            // Load Mock Data
            var oModel = new JSONModel(sap.ui.require.toUrl("project1/model/data.json"));
            this.getView().setModel(oModel, "courseModel");
            
            // Wait for data to load to run initial validation (though empty initially)
            oModel.attachRequestCompleted(function() {
                this._validateCredits();
            }.bind(this));
        },

        onAddCourse: function (oEvent) {
            var oModel = this.getView().getModel("courseModel");
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("courseModel");
            var oSelectedCourse = oContext.getObject();

            var aRegistered = oModel.getProperty("/registeredCourses");

            // Check if already added
            var bExists = aRegistered.some(function(course) {
                return course.code === oSelectedCourse.code;
            });

            if (bExists) {
                MessageToast.show("Course already added!");
                return;
            }

            // check if adding this course exceeds max credit limit
            // Requirement says "Automatically show warning alerts", but usually we allow adding and show error, 
            // OR we block adding. The screenshot shows "Not enough Credit Hour!" which implies < Min.
            // If > Max, we should probably show "Exceed Credit Hour!".
            // I'll allow adding and show the validation state.

            aRegistered.push(oSelectedCourse);
            oModel.setProperty("/registeredCourses", aRegistered);
            
            this._validateCredits();
        },

        _validateCredits: function() {
            var oModel = this.getView().getModel("courseModel");
            var aRegistered = oModel.getProperty("/registeredCourses");
            var iTotalCredits = 0;

            aRegistered.forEach(function(course) {
                iTotalCredits += course.credits;
            });

            oModel.setProperty("/ui/totalCredits", iTotalCredits);

            var iMin = oModel.getProperty("/student/minCredits");
            var iMax = oModel.getProperty("/student/maxCredits");

            var bWarningVisible = false;
            var sWarningMessage = "";
            var sWarningType = "None"; // Warning, Error, Success

            if (iTotalCredits < iMin) {
                bWarningVisible = true;
                sWarningMessage = "Not enough Credit Hours! Minimum is " + iMin;
                sWarningType = "Warning"; // Or Error depending on strictness
            } else if (iTotalCredits > iMax) {
                bWarningVisible = true;
                sWarningMessage = "Credit Limit Exceeded! Maximum is " + iMax;
                sWarningType = "Error";
            } else {
                bWarningVisible = false;
            }

            oModel.setProperty("/ui/isWarningVisible", bWarningVisible);
            oModel.setProperty("/ui/warningMessage", sWarningMessage);
            oModel.setProperty("/ui/warningType", sWarningType);
        }
    });
});