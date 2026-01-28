sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    function (Controller, JSONModel, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                // Load Mock Data
                var oModel = new JSONModel(sap.ui.require.toUrl("project1/model/data.json"));
                this.getView().setModel(oModel, "courseModel");

                oModel.attachRequestCompleted(function () {
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
                var bExists = aRegistered.some(function (course) {
                    return course.code === oSelectedCourse.code;
                });

                if (bExists) {
                    MessageToast.show("Course already added!");
                    return;
                }

                aRegistered.push(oSelectedCourse);
                oModel.setProperty("/registeredCourses", aRegistered);

                this._validateCredits();
            },

            onRemoveCourse: function (oEvent) {
                var oModel = this.getView().getModel("courseModel");
                var oList = oEvent.getSource();
                var oItem = oEvent.getParameter("listItem");
                var sPath = oItem.getBindingContext("courseModel").getPath();
                var iIndex = parseInt(sPath.split("/").pop());

                var aRegistered = oModel.getProperty("/registeredCourses");
                aRegistered.splice(iIndex, 1);

                oModel.setProperty("/registeredCourses", aRegistered);
                this._validateCredits();
            },

            onRegister: function () {
                MessageBox.success("Course registration successful!");
                // Optional: reset logic here if needed
            },

            _validateCredits: function () {
                var oModel = this.getView().getModel("courseModel");
                var aRegistered = oModel.getProperty("/registeredCourses");
                var iTotalCredits = 0;

                aRegistered.forEach(function (course) {
                    iTotalCredits += course.credits;
                });

                oModel.setProperty("/ui/totalCredits", iTotalCredits);

                var iMin = oModel.getProperty("/student/minCredits");
                var iMax = oModel.getProperty("/student/maxCredits");

                var bWarningVisible = false;
                var sWarningMessage = "";
                var sWarningType = "None";

                if (iTotalCredits < iMin) {
                    bWarningVisible = true;
                    sWarningMessage = "Not enough Credit Hour !"; // Exact text from screenshot
                    sWarningType = "Warning";
                } else if (iTotalCredits > iMax) {
                    bWarningVisible = true;
                    sWarningMessage = "Credit Limit Exceeded !";
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