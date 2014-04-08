var testCounter;
var sessionData, userData, roleData, serviceData, appData;

function initTest() {

    testCounter = 0;
    sessionData = null;
    userData = null;
    roleData = null;
    serviceData = null;
    appData = null;
}

function setupTest(type) {

    var result, params;

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // get apps
    result = getApps();
    checkResult(result.error === null, "Get all apps", result);
    appData = result.data;

    // get service
    result = getServices();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get db service", result);
    serviceData = result.data;

    // delete table
    if (tableExists("testobject")) {
        result = deleteTable();
        checkResult(result.error === null, "Delete db table", result);
    }
    result = tableExists("testobject");
    checkResult(result === false, "Verify db table deleted", "Table not deleted");

    // delete roles
    result = getRoles();
    checkResult(result.error === null, "Get roles", result);
    roleData = result.data;
    if (result.data && result.data.record && result.data.record.length > 0) {
        result = deleteRoles();
        checkResult(result.error === null, "Delete roles", result);
    }
    result = getRoles();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify roles deleted", result);
    roleData = result.data;

    // delete users
    result = getUsers();
    checkResult(result.error === null, "Get users", result);
    userData = result.data;
    if (result.data && result.data.record && result.data.record.length > 0) {
        result = deleteUsers();
        checkResult(result.error === null, "Delete users", result);
    }
    result = getUsers();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify users deleted", result);
    userData = result.data;

	// create table
    result = createTable();
    checkResult(result.error === null, "Create table", result);
    result = tableExists("testobject");
    checkResult(result === true, "Verify db table created", "Table not created");

	// create users
    result = createUsers();
    checkResult(result.error === null, "Create users", result);
    result = getUsers();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify users created", result);
    userData = result.data;

    // create roles
    result = createRoles(type);
    checkResult(result.error === null, "Create roles", result);
    result = getRoles();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify roles created", result);
    roleData = result.data;

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;
}

function ownerIdTest() {

    function testRecord() {

        var record = {
            "name": "test record for user id = " + sessionData.id,
            "OwnerId": sessionData.id
        };
        return record;
    }

    function testBatch(num) {

        data = {"record":[]};
        for (i = 0; i < num; i++) {
            data.record.push(testRecord());
        }
        return data;
    }

    console.log("Starting ownerIdTest()");

    setupTest('ownerid');

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // create 10 records as admin
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);
    params = createParams("data_record_array", testBatch(9));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 9, "Create 9 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 9, "Verify 9 records", result);
    params = createParams("data_record_object", testRecord());
    result = createRecords(params);
    checkResult(result.error === null && result.data, "Create 1 record", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Verify 10 records", result);

    // update 10 records as admin
    params = updateParams("data_record_array", [0,1,2,3,4,5,6,7,8]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 9, "Update 9 records", result);
    params = updateParams("data_record_object", [9]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "Update 1 record", result);

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;

    // user 1 login
    params = {"data": {"email":"testuser1@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 1", result);
    sessionData = result.data;

    // create 5 records as user 1
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);
    params = createParams("data_record_array", testBatch(5));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Verify 5 records", result);

    // update 5 records as user 1
    params = updateParams("data_record_array", [10,11,12,13]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Update 4 records", result);
    params = updateParams("data_record_object", [14]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "Update 1 record", result);

    // user 1 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 1", result);
    sessionData = null;

    // user 2 login
    params = {"data": {"email":"testuser2@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 2", result);
    sessionData = result.data;

    // create 5 records as user 2
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);
    params = createParams("data_record_array", testBatch(5));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Verify 5 records", result);

    // update 5 records as user 2
    params = updateParams("data_record_array", [15,16,17,18]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Update 4 records", result);
    params = updateParams("data_record_object", [19]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "Update 1 record", result);

    // user 2 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 2", result);
    sessionData = null;

    // user 1 login
    params = {"data": {"email":"testuser1@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 1", result);
    sessionData = result.data;

    // try to delete admin records as user 1 should fail
    params = deleteParams("data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "User 1 can't delete admin records", result);

    // try to delete user 2 records as user 1 should fail
    params = deleteParams("data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "User 1 can't delete user 2 records", result);

    // delete records as user 1
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Verify 5 records", result);
    params = deleteParams("data_record_array", [10,11,12,13,14]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Delete 5 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    // user 1 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 1", result);
    sessionData = null;

    // user 2 login
    params = {"data": {"email":"testuser2@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 2", result);
    sessionData = result.data;

    // delete records as user 2
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Verify 5 records", result);
    params = deleteParams("data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Delete 5 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    // user 2 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 2", result);
    sessionData = null;

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // delete records as admin
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Verify 10 records", result);
    params = deleteParams("data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Delete 10 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;
}

function valueTest() {

    function testRecord(index) {

        var record = {
            "name": "test record for user id = " + sessionData.id,
            "OwnerId": sessionData.id
        };

        if (index < 3) {
            record.curr = (index + 1) * 10000;
        } else if (index < 7) {
            record.curr = (index + 1) * 100000;
        } else {
            record.curr = (index + 1) * 1000000;
        }
        return record;
    }

    function testBatch(num) {

        data = {"record":[]};
        for (i = 0; i < num; i++) {
            data.record.push(testRecord(i));
        }
        return data;
    }

    console.log("Starting valueTest()");

    setupTest('value');

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // create 10 records as admin
    params = createParams("data_record_array", testBatch(10));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 records", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Verify 10 records", result);

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;

    // user 1 login
    params = {"data": {"email":"testuser1@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 1", result);
    sessionData = result.data;

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Verify 3 records", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr < 100000, "Verify " + record.curr, result);
    });

    // user 1 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 1", result);
    sessionData = null;

    // user 2 login
    params = {"data": {"email":"testuser2@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as user 2", result);
    sessionData = result.data;

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Verify 4 records", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr >= 100000 && record.curr < 1000000, "Verify " + record.curr, result);
    });

    // user 2 logout
    result = logout();
    checkResult(result.error === null, "Log out as user 2", result);
    sessionData = null;
}

function crudTest() {

    function testRecord() {

        var record = {
            "name": "test record for user id = " + sessionData.id,
            "OwnerId": sessionData.id
        };
        return record;
    }

    function testBatch(num) {

        data = {"record":[]};
        for (i = 0; i < num; i++) {
            data.record.push(testRecord());
        }
        return data;
    }

    console.log("Starting crudTest()");

    setupTest('ownerid');

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // create records
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    params = createParams("data_record_array", testBatch(19));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 19, "Create 19 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 19, "Verify 19 records", result);

    params = createParams("data_record_object", testRecord());
    result = createRecords(params);
    checkResult(result.error === null && result.data, "Create 1 record", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Verify 20 records", result);

    // get records using various methods
    params = getParams("data_record_array", [0,1]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("data_record_object", [2]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record", result);

    params = getParams("data_idlist_array", [3,4]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("data_idlist_string", [5,6]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("data_filter", [7,8]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("param_idlist_string", [9,10]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("param_filter", [11,12]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

    params = getParams("url_id", [13]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record", result);

    params = getParams("data_filter_replace", [14,15]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records", result);

        params = getParams("param_filter_replace", [16,17,18,19]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Get 4 records", result);

    // update records using various methods
    params = updateParams("data_record_array", [0,1]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("data_record_object", [2]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "Update 1 record", result);

    params = updateParams("data_idlist_array", [3,4]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("data_idlist_string", [5,6]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("data_filter", [7,8]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("param_idlist_string", [9,10]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("param_filter", [11,12]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("url_id", [13]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "Update 1 record", result);

    params = updateParams("data_filter_replace", [14,15]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Update 2 records", result);

    params = updateParams("param_filter_replace", [16,17,18,19]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Update 4 records", result);

    // delete records using various methods
    params = deleteParams("data_record_array", [0,1]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 18, "Verify 18 records", result);

    params = deleteParams("data_record_object", [2]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data, "Delete 1 record", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 17, "Verify 17 records", result);

    params = deleteParams("data_idlist_array", [3,4]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 15, "Verify 15 records", result);

    params = deleteParams("data_idlist_string", [5,6]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 13, "Verify 13 records", result);

    params = deleteParams("data_filter", [7,8]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 11, "Verify 11 records", result);

    params = deleteParams("param_idlist_string", [9,10]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 9, "Verify 9 records", result);

    params = deleteParams("param_filter", [11,12]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 7, "Verify 7 records", result);

    params = deleteParams("url_id", [13]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data , "Delete 1 record", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 6, "Verify 6 records", result);

    params = deleteParams("data_filter_replace", [14,15]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Verify 4 records", result);

    params = deleteParams("param_filter_replace", [16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Delete 4 records", result);

    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;
}

function rollbackTest() {

    function testRecord(index) {

        var record = {
            "name": "test record for user id = " + sessionData.id
        };

        if (index != 4 && index != 7) {
            record.OwnerId  = sessionData.id;
        }

        return record;
    }

    function testBatch(num) {

        data = {"record":[]};
        for (i = 0; i < num; i++) {
            data.record.push(testRecord(i));
        }
        return data;
    }

    console.log("Starting rollbackTest()");

    setupTest('value');

    // admin login
    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Log in as admin", result);
    sessionData = result.data;

    // create 10 records as admin, all should be rolled back
    params = createParams("data_record_array", testBatch(10));
    params.params += "&rollback=true";
    result = createRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4", "Create 10 records with rollback", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify 0 records", result);

    // create 10 records as admin, only index 4 and 7 should fail
    params = createParams("data_record_array", testBatch(10));
    params.params += "&continue=true";
    result = createRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4,7", "Create 10 records with continue", result);
    params = getParams("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 8, "Verify 8 records", result);

    // admin logout
    result = logout();
    checkResult(result.error === null, "Log out as admin", result);
    sessionData = null;
}