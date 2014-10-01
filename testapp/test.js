var sessionData, userData, roleData, serviceData, appData;

function initTest() {

    var result;

    sessionData = null;
    userData = null;
    roleData = null;
    serviceData = null;
    appData = null;

    adminLogin();

    // avoid this scenario:
    // local db test leaves records
    // mongo test tries to delete users but can't because that user created the leftover records
    $.each(tableList, function( index, name ) {
        truncateLocalTable(name);
    });

    // get apps
    result = getApps();
    checkResult(result.error === null, "Get all apps", result);
    appData = result.data;

    // get service
    result = getServices();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get db service", result);
    serviceData = result.data;

    // delete tables
    $.each(tableList.slice(0).reverse(), function( index, name ) {
        if (tableExists(name)) {
            result = deleteTable(name);
            checkResult(result.error === null, "Delete db table " + name, result);
        }
        result = tableExists(name);
        checkResult(result === false, "Verify db table " + name + " deleted", "Table " + name + " not deleted");
    });

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

	// create tables
    $.each(createList, function( index, name ) {
        result = createTable(name);
        checkResult(result.error === null, "Create db table " + name, result);
        result = tableExists(name);
        checkResult(result === true, "Verify db table " + name + " created", "Table " + name + " not created");
    });

	// create users
    result = createUsers();
    checkResult(result.error === null, "Create users", result);
    result = getUsers();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify users created", result);
    userData = result.data;

    // create roles
    result = createRoles();
    checkResult(result.error === null, "Create roles", result);
    result = getRoles();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify roles created", result);
    roleData = result.data;

    userLogout();
}

function createOne(offset, amt) {

    var size;

    recordCounts["testobject"]++;
    var record = {
        "name": "test record #" + recordCounts["testobject"] + ", userid=" + sessionData.id,
        "OwnerId": sessionData.id
    };
    record.curr = amt + offset;

    if (amt < 1000) {
        size="small";
    } else if (amt < 2000) {
        size="medium";
    } else {
        size="large";
    }
    record.pick = size;
    record.str = size;
    if (dbInfo.generateIds) {
        var id = recordCounts["testobject"];
        record[dbInfo.idField] = formatJsonId(id);
    }
    return record;
}

function createBatch(num, amt) {

    if (amt === undefined) {
        amt = 2000;
    }
    data = {"record":[]};
    for (i = 0; i < num; i++) {
        data.record.push(createOne(i, amt));
    }
    return data;
}

function crudTest() {

    console.log("Starting crudTest()");
    adminLogin();
    simpleCreateTest();
    simpleGetTest();
    simpleUpdateTest();
    if (serviceData.record[0].type === "NoSQL DB") {
        simplePutTest();
    }
    simpleDeleteTest();
    userLogout();
}

// create records as admin using various methods, role filters do not apply

function simpleCreateTest() {

    var result, params;

    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);

    params = createParams("data_record_array", createBatch(10));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 records (data_record_array)", result);
    checkRecordCount("testobject", 10);

    params = createParams("data_record_array", createBatch(1));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Create 1 record (data_record_array)", result);
    checkRecordCount("testobject", 11);

    params = createParams("data_record_object", createOne(0, 2000));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data, "Create 1 record (data_record_object)", result);
    checkRecordCount("testobject", 12);

    var data = createOne(0, 2000);
    data.OwnerId = userData.record[0].id;
    params = createParams("data_record_object", data);
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data, "Create 1 record with another user's OwnerId (data_record_object)", result);
    checkRecordCount("testobject", 13);

    if (serviceData.record[0].type !== "NoSQL DB") {
        var data = createOne(0, 2000);
        delete data.OwnerId;
        params = createParams("data_record_object", data);
        result = createRecords("testobject", params);
        checkResult(result.error, "Try to create 1 record with no OwnerId (data_record_object)", result);
        checkRecordCount("testobject", 13);
    }
}

// get records as admin using various methods, role filters do not apply

function simpleGetTest() {

    var result, params;

    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount("testobject", 20);

    // get records using various methods
    params = getParamsByIds("testobject", "data_record_array", [0,1]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_record_array)", result);

    params = getParamsByIds("testobject", "data_record_object", [2]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record (data_record_object)", result);

    params = getParamsByIds("testobject", "data_idlist_array", [3,4]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_idlist_array)", result);

    params = getParamsByIds("testobject", "data_idlist_string", [5,6]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_idlist_string)", result);

    params = getParamsByIds("testobject", "param_idlist_string", [7,8]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (param_idlist_string)", result);

    params = getParamsByIds("testobject", "url_id", [9]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record (url_id)", result);

    // AND filter
    params = getParamsByFilter("testobject", "data_filter", {"cond":[{"field": "curr","op": ">=","value": 2000},{"field": "curr","op": "<=","value": 2004}],"logic":"and"});
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Get records with AND filter", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr >= 2000 && record.curr <= 2004, "Verify 2000 <= " + record.curr + " <= 2004", result);
    });

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = getParamsByFilter("testobject", "data_filter", idFilter("testobject",[10,11]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_filter)", result);

        params = getParamsByFilter("testobject", "param_filter", idFilter("testobject",[12,13]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (param_filter)", result);

        params = getParamsByFilter("testobject", "data_filter_replace", idFilter("testobject",[14,15]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_filter_replace)", result);

        params = getParamsByFilter("testobject", "param_filter_replace", idFilter("testobject",[16,17,18,19]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Get 4 records (param_filter_replace)", result);
    }
}

// update a single field (patch)

function updateOne() {

    var record = {
        "updated": true
    };
    return record;
}

// update records as admin using various methods, role filters do not apply

function simpleUpdateTest() {

    var result, params;

    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount("testobject", 20);

    // update records using various methods
    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [0,1]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_record_array)", result);

    params = updateParamsByIds("testobject", "data_record_object", updateOne(), [2]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "PATCH 1 record (data_record_object)", result);

    params = updateParamsByIds("testobject", "data_idlist_array", updateOne(), [3,4]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_idlist_array)", result);

    params = updateParamsByIds("testobject", "data_idlist_string", updateOne(), [5,6]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_idlist_string)", result);

    params = updateParamsByIds("testobject", "param_idlist_string", updateOne(), [7,8]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (param_idlist_string)", result);

    params = updateParamsByIds("testobject", "url_id", updateOne(), [9]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "PATCH 1 record (url_id)", result);

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = updateParamsByFilter("testobject", "data_filter", updateOne(), idFilter("testobject",[10,11]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_filter)", result);

        params = updateParamsByFilter("testobject", "param_filter", updateOne(), idFilter("testobject",[12,13]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (param_filter)", result);

        params = updateParamsByFilter("testobject", "data_filter_replace", updateOne(), idFilter("testobject",[14,15]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_filter_replace)", result);

        params = updateParamsByFilter("testobject", "param_filter_replace", updateOne(), idFilter("testobject",[16,17,18,19]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "PATCH 4 records (param_filter_replace)", result);
    }
}

function batchByIds(data, ids) {

    var result = {"record": []};
    $.each(ids, function(index, id) {
        var match = oneById(data, id);
        if (match) {
            result.record.push(match);
        }
    });
    return result;
}

function oneById(data, id) {

    var result = null;
    var clone = cloneObject(data);
    $.each(clone.record, function(index, record) {
        if (record[dbInfo.idField] === id) {
            record.updated = true;
            result = record;
        }
    });
    return result;
}

// update all fields (put)

function simplePutTest() {

    var result, params, saveData;

    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount("testobject", 20);
    saveData = result.data;
    checkResult(saveData.record[0].updated === undefined && saveData.record[1].updated === undefined, "Verify 'updated' field not present", result);

    params = updateParamsByIds("testobject", "data_record_batch", batchByIds(saveData, getIdArray("testobject", [0,1])), [0,1]);
    params.put = true;
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PUT 2 records (data_record_batch)", result);

    params = getParamsByIds("testobject", "data_record_array", [0]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get updated record", result);
    checkResult(result.data.record[0].updated === 1 || result.data.record[0].updated === true, "Verify 'updated' field", result);
    checkResult(result.data.record[0].name === saveData.record[0].name, "Verify 'name' field", result);
    checkResult(result.data.record[0].curr === saveData.record[0].curr, "Verify 'curr' field", result);
}

// delete records as admin using various methods, role filters do not apply

function simpleDeleteTest() {

    var result, params;

    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount("testobject", 20);

    // delete records using various methods
    params = deleteParamsByIds("testobject", "data_record_array", [0,1]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount("testobject", 18);

    params = deleteParamsByIds("testobject", "data_record_array", [2]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data, "Delete 1 record", result);
    checkRecordCount("testobject", 17);

    params = deleteParamsByIds("testobject", "data_idlist_array", [3,4]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount("testobject", 15);

    params = deleteParamsByIds("testobject", "data_idlist_string", [5,6]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount("testobject", 13);

    params = deleteParamsByIds("testobject", "param_idlist_string", [7,8]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount("testobject", 11);

    params = deleteParamsByIds("testobject", "url_id", [9]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data , "Delete 1 record", result);
    checkRecordCount("testobject", 10);

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = deleteParamsByFilter("testobject", "data_filter", idFilter("testobject",[10,11]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (data_filter)", result);
        checkRecordCount("testobject", 8);

        params = deleteParamsByFilter("testobject", "param_filter", idFilter("testobject",[12,13]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (param_filter)", result);
        checkRecordCount("testobject", 6);

        params = deleteParamsByFilter("testobject", "data_filter_replace", idFilter("testobject",[14,15]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (data_filter_replace)", result);
        checkRecordCount("testobject", 4);

        params = deleteParamsByFilter("testobject", "param_filter_replace", idFilter("testobject",[16,17,18,19]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Delete 4 records (param_filter_replace)", result);
        checkRecordCount("testobject", 0);
    }
}

function ownerIdTest() {

    var result, params;

    console.log("Starting ownerIdTest()");

    adminLogin();
    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);
    result = updateRoles('ownerid');
    checkResult(result.error === null, "Set roles to OwnerId mode", result);

    // CREATE

    params = createParams("data_record_array", createBatch(10));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 records as admin", result);
    checkRecordCount("testobject", 10);

    userLogout();
    user1Login();

    checkRecordCount("testobject", 0);
    params = createParams("data_record_array", createBatch(5));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records as user 1", result);
    checkRecordCount("testobject", 5);

    userLogout();
    user2Login();

    checkRecordCount("testobject", 0);
    params = createParams("data_record_array", createBatch(5));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records as user 2", result);
    checkRecordCount("testobject", 5);

    userLogout();
    user2Login();

    // GET

    params = getParamsByIds("testobject", "param_idlist_string", [0]);
    result = getRecords(params);
    checkResult(result.error !== null, "Try to get 1 admin record as user 2", result);

    params = getParamsByIds("testobject", "param_idlist_string", [10]);
    result = getRecords(params);
    checkResult(result.error !== null, "Try to get 1 user 1 record as user 2", result);

    params = getParamsByIds("testobject", "param_idlist_string", [15,10,17,11,19]);
    params.queryParams += "&continue=true";
    result = getRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context &&
        result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "1,3" &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[0][dbInfo.idField] === createdRecords["testobject"][15][dbInfo.idField] &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[2][dbInfo.idField] === createdRecords["testobject"][17][dbInfo.idField] &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[4][dbInfo.idField] === createdRecords["testobject"][19][dbInfo.idField],
        "Try to get 5 user 2 records as user 2 with two user 1 record ids (continue=true)", result);

    params = getParamsByIds("testobject", "param_idlist_string", [15,10,17,11,19]);
    result = getRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context &&
        result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "1" &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[0][dbInfo.idField] === createdRecords["testobject"][15][dbInfo.idField],
        "Try to get 5 user 2 records as user 2 with two user 1 record ids (continue=false)", result);

    userLogout();
    user1Login();

    // UPDATE

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [10,11,12,13,14]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Update 5 records as user 1", result);

    userLogout();
    user2Login();

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [15,16,17,18,19]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Update 5 records as user 2", result);

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [0]);
    result = updateRecords(params);
    checkResult(result.error !== null, "Try to update 1 admin record as user 2", result);

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [10]);
    result = updateRecords(params);
    checkResult(result.error !== null, "Try to update 1 user 1 record as user 2", result);

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [15,10,17,11,19]);
    params.queryParams += "&continue=true";
    result = updateRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context &&
        result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "1,3" &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[0][dbInfo.idField] == createdRecords["testobject"][15][dbInfo.idField] &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[2][dbInfo.idField] == createdRecords["testobject"][17][dbInfo.idField] &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[4][dbInfo.idField] == createdRecords["testobject"][19][dbInfo.idField], // === fails due to id being string
        "Try to update 5 user 2 records as user 2 with two user 1 record ids (continue=true)", result);

    params = updateParamsByIds("testobject", "data_record_array", updateOne(), [15,10,17,11,19]);
    result = updateRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context &&
        result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "1" &&
        result.rawError.error[0].context.record && result.rawError.error[0].context.record[0][dbInfo.idField] == createdRecords["testobject"][15][dbInfo.idField], // === fails due to id being string
        "Try to update 5 user 2 records as user 2 with two user 1 record ids (continue=false)", result);

    userLogout();
    user1Login();

    // DELETE

    params = deleteParamsByIds("testobject", "data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete admin records as user 1", result);

    params = deleteParamsByIds("testobject", "data_record_array", [15,16,17,18,19]);
    params.queryParams += "&continue=true";
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete user 2 records as user 1 (continue=true)", result);

    params = deleteParamsByIds("testobject", "data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete user 2 records as user 1 (continue=false)", result);

    // delete records as user 1, throw in some user 2 records
    checkRecordCount("testobject", 5);
    params = deleteParamsByIds("testobject", "data_record_array", [10,15,12,18,14]);
    params.queryParams += "&continue=true";
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete 3 user 1 records and 2 user 2 records as user 1 (continue=true)", result);
    checkRecordCount("testobject", 2);

    params = deleteParamsByIds("testobject", "data_record_array", [11,13]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records as user 1", result);
    checkRecordCount("testobject", 0);

    userLogout();
    user2Login();

    // delete records as user 2
    checkRecordCount("testobject", 5);
    params = deleteParamsByIds("testobject", "data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Delete 5 records as user 2", result);
    checkRecordCount("testobject", 0);

    userLogout();
    adminLogin();

    checkRecordCount("testobject", 10);
    params = deleteParamsByIds("testobject", "data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Delete 10 records as admin", result);
    checkRecordCount("testobject", 0);

    userLogout();
}

function valueTest(mode) {

    var result, params;

    console.log("Starting valueTest(" + mode + ")");

    adminLogin();
    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);
    result = updateRoles(mode);
    checkResult(result.error === null, "Set roles to " + mode + " mode", result);

    params = createParams("data_record_array", createBatch(3, 0));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Create 3 records as admin for user 1", result);
    checkRecordCount("testobject", 3);

    params = createParams("data_record_array", createBatch(4, 1000));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Create 4 records as admin for user 2", result);
    checkRecordCount("testobject", 7);

    params = createParams("data_record_array", createBatch(3, 2000));
    result = createRecords("testobject", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Create 3 records as admin for admin", result);
    checkRecordCount("testobject", 10);

    userLogout();
    user1Login();

    params = getParamsByIds("testobject", "data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Verify 3 records for user 1", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr < 1000, "Verify " + record.curr, result);
    });

    params = createParams("data_record_object", createOne(0, 2000));
    result = createRecords("testobject", params);
    checkResult(result.error, "Try to create admin record as user 1", result);

    params = updateParamsByIds("testobject", "data_record_object", updateOne(), [9]);
    result = updateRecords(params);
    checkResult(result.error, "Try to update admin record as user 1", result);

    params = deleteParamsByIds("testobject", "data_record_array", [9]);
    result = deleteRecords(params);
    checkResult(result.error, "Try to delete admin record as user 1", result);

    params = createParams("data_record_object", createOne(0, 1000));
    result = createRecords("testobject", params);
    checkResult(result.error, "Try to create user 2 record as user 1", result);

    params = updateParamsByIds("testobject", "data_record_object", updateOne(), [5]);
    result = updateRecords(params);
    checkResult(result.error, "Try to update user 2 record as user 1", result);

    params = deleteParamsByIds("testobject", "data_record_array", [5]);
    result = deleteRecords(params);
    checkResult(result.error, "Try to delete user 2 record as user 1", result);

    userLogout();
    user2Login();

    params = getParamsByIds("testobject", "data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Verify 4 records for user 2", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr >= 1000 && record.curr < 2000, "Verify " + record.curr, result);
    });

    userLogout();
}

function rollbackTest() {

    var result, params;

    console.log("Starting rollbackTest()");

    adminLogin();
    deleteAllRecords("testobject");
    checkRecordCount("testobject", 0);
    result = updateRoles('number');
    checkResult(result.error === null, "Set roles to value mode", result);

    userLogout();
    user1Login();

    // create 10 records as user 1, index 4 and 7 are bad, all should be rolled back
    params = createParams("data_record_array", createBatch(10, 0));
    params.data.record[4].curr = 2000;
    params.data.record[7].curr = 2000;
    params.queryParams += "&rollback=true";
    result = createRecords("testobject", params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4", "Create 10 records with rollback, 2 bad records", result);
    checkRecordCount("testobject", 0);

    // create 10 records as user 1, only index 4 and 7 should fail
    params = createParams("data_record_array", createBatch(10, 0));
    params.data.record[4].curr = 2000;
    params.data.record[7].curr = 2000;
    params.queryParams += "&continue=true";
    result = createRecords("testobject", params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4,7", "Create 10 records with continue, 2 bad records", result);
    checkRecordCount("testobject", 8);

    userLogout();
}

function adminLogin() {

    var result, params;

    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Admin login", result);
    sessionData = result.data;
}

function user1Login() {

    var result, params;

    params = {"data": {"email":"testuser1@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "User 1 login", result);
    sessionData = result.data;
}

function user2Login() {

    var result, params;

    params = {"data": {"email":"testuser2@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "User 2 login", result);
    sessionData = result.data;
}

function userLogout() {

    var result;

    result = logout();
    checkResult(result.error === null, "Logout", result);
    sessionData = null;
}

function checkRecordCount(name, num) {

    var params, result;

    params = getParamsByIds(name, "data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === num, "Check for " + num + " " + name + " records", result);
}

function deleteAllRecords(name) {

    var result;

    result = truncateTable(name);
    checkResult(result.error === null, "Delete all " + name + " records", result);
}