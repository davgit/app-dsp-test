
$(document).ready(function() {

    runApp();
});

function runApp() {

    initTest();
    initApi();
    crudTest();
    ownerIdTest();
    valueTest("number");
    valueTest("string");
    valueTest("picklist");
    valueTest("lookup");
    rollbackTest();
    console.log("All tests passed!");
}