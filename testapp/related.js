function createContacts(num) {

    var data, record, childRecord, contact, info, id;

    data = {"record":[]};
    for (contact = 0; contact < num; contact++) {
        recordCounts["contact"]++;
        record = {
            "first_name": "Contact",
            "last_name": recordCounts["contact"],
            "display_name": "Contact " + recordCounts["contact"],
            "contact_infos_by_contact_id": []
        };
        if (dbInfo.generateIds) {
            id = recordCounts["contact"];
            record[dbInfo.idField] = formatJsonId(id);
        }
        for (info = 0; info < contact; info++) {
            recordCounts["contact_info"]++;
            var childRecord = {
                "info_type": "work",
                "phone": "contact " + recordCounts["contact"] + " info #" + (info + 1),
                "email": "contact" + recordCounts["contact"] + "@acme.com",
                "address": "1234 Demo Way",
                "city": "ATLANTA",
                "state": "GA",
                "zip": "30303",
                "country": "USA"
            }
            if (dbInfo.generateIds) {
                id = recordCounts["contact_info"];
                childRecord[dbInfo.idField] = formatJsonId(id);
            }
            record.contact_infos_by_contact_id.push(childRecord);
        }
        data.record.push(record);
    }
    return data;
}

function createGroups(num) {

    var data, record, group, id;

    data = {"record":[]};
    for (group = 0; group < num; group++) {
        recordCounts["contact_group"]++;
        record = {
            "name": "Group " + recordCounts["contact_group"],
            "description": "Test group #" + recordCounts["contact_group"]
        };
        if (dbInfo.generateIds) {
            id = recordCounts["contact_group"];
            record[dbInfo.idField] = formatJsonId(id);
        }
        data.record.push(record);
    }
    return data;
}

function createLinkers() {

    var data, record, contact, id;

    data = {"record":[]};
    // assign contact ids 1-5 to group id 1
    for (contact = 1; contact <= 5; contact++) {
        recordCounts["contact_group_relationship"]++;
        record = {
            "contact_id": contact,
            "contact_group_id": 1
        };
        if (dbInfo.generateIds) {
            id = recordCounts["contact_group_relationship"];
            record[dbInfo.idField] = formatJsonId(id);
        }
        data.record.push(record);
    }
    // assign contact ids 3-10 to group id 2
    for (contact = 3; contact <= 10; contact++) {
        recordCounts["contact_group_relationship"]++;
        record = {
            "contact_id": contact,
            "contact_group_id": 2
        };
        if (dbInfo.generateIds) {
            id = recordCounts["contact_group_relationship"];
            record[dbInfo.idField] = formatJsonId(id);
        }
        data.record.push(record);
    }
    return data;
}

function relatedCreateTest() {

    var params, result;

    deleteAllRecords("contact_group_relationship");
    checkRecordCount("contact_group_relationship", 0);

    deleteAllRecords("contact_group");
    checkRecordCount("contact_group", 0);

    deleteAllRecords("contact_info");
    checkRecordCount("contact_info", 0);

    deleteAllRecords("contact");
    checkRecordCount("contact", 0);

    params = createParams("data_record_array", createContacts(10));
    result = createRecords("contact", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 contacts and 45 contact_infos (data_record_array)", result);
    checkRecordCount("contact", 10);

    params = createParams("data_record_array", createGroups(2));
    result = createRecords("contact_group", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Create 2 contact_groups (data_record_array)", result);
    checkRecordCount("contact_group", 2);

    params = createParams("data_record_array", createLinkers());
    result = createRecords("contact_group_relationship", params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 13, "Create 13 linkers (data_record_array)", result);
    checkRecordCount("contact_group_relationship", 13);
}

function relatedGetTest() {

    var contactId, groupId, id;
    var contact, info, group, linker;
    var params, result, length, count, min, max;

    // get contacts and contact_infos
    params = getParamsByIds("contact", "data_record_array", []);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Get 10 contacts (data_record_array)", result);
    for (contact = 0; contact < result.data.record.length; contact++) {
        // check number of infos for each contact
        length = result.data.record[contact].contact_infos_by_contact_id.length;
        checkResult(length === contact, "Verify contact " + (contact + 1) + " has " + length + " contact_infos");
        // check that each info belongs to the correct contact
        contactId = result.data.record[contact].id;
        for (info = 0; info < length; info++) {
            id = result.data.record[contact].contact_infos_by_contact_id[info].contact_id;
            checkResult(id === contactId, "Verify contact " + (contact + 1) + " contact_info " + (info + 1) + " has contact_id = " + contactId);
        }
    }

    // get contacts and linkers
    params = getParamsByIds("contact", "data_record_array", []);
    params.queryParams += "&related=contact_group_relationships_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Get 10 contacts (data_record_array)", result);
    for (contact = 0; contact < result.data.record.length; contact++) {
        // check number of linkers for each contact
        length = result.data.record[contact].contact_group_relationships_by_contact_id.length;
        if (contact < 2 || contact > 4) {
            count = 1;
        } else {
            count = 2;
        }
        checkResult(length === count, "Verify contact " + (contact + 1) + " has " + length + " linkers");
        // check that each linker is for the correct contact
        contactId = result.data.record[contact].id;
        for (linker = 0; linker < length; linker++) {
            id = result.data.record[contact].contact_group_relationships_by_contact_id[linker].contact_id;
            checkResult(id === contactId, "Verify contact " + (contact + 1) + " linker " + (linker + 1) + " has contact_id = " + contactId);
        }
    }

    // get contacts and groups
    params = getParamsByIds("contact", "data_record_array", []);
    params.queryParams += "&related=contact_groups_by_contact_group_relationship";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Get 10 contacts (data_record_array)", result);
    for (contact = 0; contact < result.data.record.length; contact++) {
        // check number of groups for each contact
        length = result.data.record[contact].contact_groups_by_contact_group_relationship.length;
        if (contact < 2 || contact > 4) {
            count = 1;
        } else {
            count = 2;
        }
        checkResult(length === count, "Verify contact " + (contact + 1) + " has " + length + " contact_groups");
        // check that the groups for each contact are correct
        for (group = 0; group < length; group++) {
            id = result.data.record[contact].contact_groups_by_contact_group_relationship[group].id;
            if (contact < 2) {
                min = 1;
                max = 1;
            } if (contact > 4) {
                min = 2;
                max = 2;
            } else {
                min = 1;
                max = 2;
            }
            checkResult(id >= min && id <= max, "Verify contact " + (contact + 1) + " group " + (group + 1) + " id = " + id);
        }
    }

    // get groups and contacts
    params = getParamsByIds("contact_group", "data_record_array", []);
    params.queryParams += "&related=contacts_by_contact_group_relationship";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 contact_groups (data_record_array)", result);
    for (group = 0; group < result.data.record.length; group++) {
        length = result.data.record[group].contacts_by_contact_group_relationship.length;
        if (group === 0) {
            min = 1;
            max = 5;
            count = 5;
        } else {
            min = 3;
            max = 10;
            count = 8;
        }
        checkResult(length === count, "Verify group " + (group + 1) + " has " + length + " contact records");
        for (contact = 0; contact < length; contact++) {
            id = result.data.record[group].contacts_by_contact_group_relationship[contact].id;
            checkResult(id >= min && id <= max, "Verify group " + (group + 1) + " contact " + (contact + 1) + " id = " + id);
        }
    }

    // get groups and linkers
    params = getParamsByIds("contact_group", "data_record_array", []);
    params.queryParams += "&related=contact_group_relationships_by_contact_group_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 contact_groups (data_record_array)", result);
    for (group = 0; group < result.data.record.length; group++) {
        length = result.data.record[group].contact_group_relationships_by_contact_group_id.length;
        if (group === 0) {
            count = 5;
        } else {
            count = 8;
        }
        checkResult(length === count, "Verify group " + (group + 1) + " has " + length + " linker records");
        groupId = result.data.record[group].id;
        for (linker = 0; linker < length; linker++) {
            id = result.data.record[group].contact_group_relationships_by_contact_group_id[linker].contact_group_id;
            checkResult(groupId === id, "Verify group " + (group + 1) + " linker " + (linker + 1) + " has contact_group_id = " + groupId);
        }
    }

    // get contact_infos and contacts
    params = getParamsByIds("contact_info", "data_record_array", []);
    params.queryParams += "&related=contact_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 45, "Get 45 contact_infos (data_record_array)", result);
    for (info = 0; info < result.data.record.length; info++) {
        contactId = result.data.record[info].contact_id;
        id = result.data.record[info].contact_by_contact_id.id;
        checkResult(contactId === id, "Verify info " + (info + 1) + " contact_id = " + contactId);
    }

    // get linkers and contacts
    params = getParamsByIds("contact_group_relationship", "data_record_array", []);
    params.queryParams += "&related=contact_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 13, "Get 13 linkers (data_record_array)", result);
    for (linker = 0; linker < result.data.record.length; linker++) {
        contactId = result.data.record[linker].contact_id;
        id = result.data.record[linker].contact_by_contact_id.id;
        checkResult(contactId === id, "Verify linker " + (linker + 1) + " contact_id = " + contactId);
    }

    // get linkers and groups
    params = getParamsByIds("contact_group_relationship", "data_record_array", []);
    params.queryParams += "&related=contact_group_by_contact_group_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 13, "Get 13 linkers (data_record_array)", result);
    for (linker = 0; linker < result.data.record.length; linker++) {
        groupId = result.data.record[linker].contact_group_id;
        id = result.data.record[linker].contact_group_by_contact_group_id.id;
        checkResult(groupId === id, "Verify linker " + (linker + 1) + " contact_group_id = " + groupId);
    }
}

function relatedUpdateTest() {

    var params, result, i, response, newInfo, newInfoId, id;

    // get records and update to delete last child from each
    params = getParamsByIds("contact", "data_record_array", []);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Get 10 contacts (data_record_array)", result);

    // update
    for (i = 0; i < result.data.record.length; i++) {
        //result.data.record[i].reports_to = null;
        var length = result.data.record[i].contact_infos_by_contact_id.length;
        if (length > 0) {
            result.data.record[i].contact_infos_by_contact_id[length - 1].contact_id = null;
            params = updateParamsByIds("contact", "url_id", result.data.record[i], [i]);
            params.queryParams += "&related=contact_infos_by_contact_id&allow_related_delete=true";
            response = updateRecords(params);
            checkResult(response.error === null, "PATCH contact " + (i + 1) + " to delete last contact_info (data_record_array)", response);
        }
    }

    // get records and check number of children
    params = getParamsByIds("contact", "data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Get 10 contacts (data_record_array)", result);
    for (i = 1; i < result.data.record.length; i++) {
        checkResult(result.data.record[i].contact_infos_by_contact_id.length === i - 1, "Verify contact " + (i + 1) + " has " + (i - 1) + " contact_infos", result);
    }

    // add a contact_info to contact 1
    recordCounts["contact_info"]++;
    var newInfo = {
        "info_type": "work",
        "phone": "extra",
        "email": "extra@acme.com",
        "address": "1234 Demo Way",
        "city": "ATLANTA",
        "state": "GA",
        "zip": "30303",
        "country": "USA"
    };
    if (dbInfo.generateIds) {
        id = recordCounts["contact_info"];
        newInfo[dbInfo.idField] = formatJsonId(id);
    }
    result.data.record[0].contact_infos_by_contact_id.push(newInfo);
    params = updateParamsByIds("contact", "url_id", result.data.record[0], [0]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = updateRecords(params);
    checkResult(response.error === null, "PATCH contact 1 to add a new contact_info (data_record_array)", result);

    // verify contact_info added to contact 1
    params = getParamsByIds("contact", "data_record_array", [0,1]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 contacts (data_record_array)", result);
    checkResult(result.data.record[0].contact_infos_by_contact_id.length === 1, "Verify contact 1 has 1 contact_info", result);

    // assign new info to contact 2
    newInfoId = result.data.record[0].contact_infos_by_contact_id[0].id;
    result.data.record[1].contact_infos_by_contact_id.push({"id": newInfoId});
    params = updateParamsByIds("contact", "data_record_object", result.data.record[1], [1]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = updateRecords(params);
    checkResult(result.error === null, "PATCH contact 2 to reassign contact_info (data_record_array)", result);

    // check for 1 contact_info on contact 2
    params = getParamsByIds("contact", "data_record_array", [1]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get 1 contact (data_record_array)", result);
    checkResult(result.data.record[0].contact_infos_by_contact_id.length === 1, "Verify contact 2 has 1 contact_info", result);

    // check for 0 contact_infos on contact 1
    params = getParamsByIds("contact", "data_record_array", [0]);
    params.queryParams += "&related=contact_infos_by_contact_id";
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get 1 contact (data_record_array)", result);
    checkResult(result.data.record[0].contact_infos_by_contact_id.length === 0, "Verify contact 1 has 0 contact_info", result);
}

function relatedDeleteTest() {

    var params, result;

    // verify cascade delete

    // delete group 1, should delete 5/13 linkers
    params = deleteParamsByIds("contact_group", "data_record_array", [0]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data, "Delete group 1", result);
    checkRecordCount("contact_group", 1);
    checkRecordCount("contact_group_relationship", 8);

    // delete contact 3, should delete 1/36 contact_infos and 1/8 linkers
    params = deleteParamsByIds("contact", "data_record_array", [2]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data, "Delete contact 3", result);
    checkRecordCount("contact", 9);
    checkRecordCount("contact_info", 36);
    checkRecordCount("contact_group_relationship", 7);

    // delete all contacts, should delete all contact_infos and linkers
    deleteAllRecords("contact");
    checkRecordCount("contact", 0);
    checkRecordCount("contact_info", 0);
    checkRecordCount("contact_group_relationship", 0);

    // delete all contact_groups
    deleteAllRecords("contact_group");
    checkRecordCount("contact_group", 0);
}

function relatedTest() {

    console.log("Starting relatedTest()");
    adminLogin();
    relatedCreateTest();
    relatedGetTest();
    relatedUpdateTest();
    relatedDeleteTest();
    userLogout();
}