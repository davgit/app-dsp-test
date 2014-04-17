
$(document).ready(function() {

    runApp();
});

function runApp() {

    initTest();
    initApi();
    crudTest();
    ownerIdTest();
    valueTest("value");
    valueTest("lookup");
    rollbackTest();
    console.log("All tests passed!");
}