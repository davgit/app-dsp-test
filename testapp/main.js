
var dbInfo;

$(document).ready(function() {

    $.each(dbList, function( index, value ) {
        dbInfo = value;
        runApp();
    });
});

function runApp() {

    console.log(getStartMsg(dbInfo));
    initApi();
    initTest();
    if (dbInfo.testRelated === true) {
        relatedTest();
    }
    crudTest();
    ownerIdTest();
    valueTest("number");
    valueTest("string");
    valueTest("picklist");
    valueTest("lookup");
    rollbackTest();
    console.log(getSuccessMsg(dbInfo));
}

function getStartMsg(info) {

    var msg = "***** Starting tests for dbService=" + info.dbService;
    if (info.idField) {
        msg += " idField=" + info.idField;
    }
    if (info.idType) {
        msg += " idType=" + info.idType;
    }
    if (info.generateIds) {
        msg += " generateIds=" + info.generateIds;
    }
    if (info.testRelated) {
        msg += " testRelated=" + info.testRelated;
    }
    return msg;
}

function getSuccessMsg(info) {

    var msg = "***** All tests passed for dbService=" + info.dbService;
    if (info.idField) {
        msg += " idField=" + info.idField;
    }
    if (info.idType) {
        msg += " idType=" + info.idType;
    }
    if (info.generateIds) {
        msg += " generateIds=" + info.generateIds;
    }
    if (info.testRelated) {
        msg += " testRelated=" + info.testRelated;
    }
    return msg;
}