var testCounter, createdRecords, recordCounts, tableList, createList;

function initApi() {

    testCounter = 0;
    createdRecords = {};
    recordCounts = {};
    tableList = ["testobject", "contact", "associated_contact", "contact_group", "contact_group_relationship", "contact_info"];
    if (dbInfo.testRelated === true) {
        createList = tableList;
    } else {
        createList = ["testobject", "contact"];
    }
    $.each(createList, function( index, name ) {
        createdRecords[name] = [];
        recordCounts[name] = 0;
    });
}

function login(params) {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
        beforeSend: setHeaders,
        type: 'POST',
		dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/user/session',
        data: JSON.stringify(params.data),
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function logout() {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/user/session',
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getApps() {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/app',
        cache:false,
        async: false,
		success:function (response) {
		    result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function createParams(method, data) {

    queryParams = "fields=*";
    return {"data":data, "queryParams":queryParams, "method":method};
}

function createRecords(name, params) {

    var result = {"rawError": null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:  'json',
        contentType:'application/json',
        url: hostUrl + "/rest/" + dbInfo.dbService + "/" + name + "?" + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
            switch (params.method) {
                case "data_record_array":
                    $.each(response.record, function(index, record) {
                        createdRecords[name].push(record);
                    });
                    break;
                case "data_record_object":
                    createdRecords[name].push(response);
                    break;
            }
        },
        error: function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getParamsByIds(name, method, indices) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    var ids = getIdArray(name, indices);
    if (ids.length > 0) {
        switch (method) {
            case "data_record_array":
                data = {"record": []};
                $.each(ids, function(index, record) {
                    var newRec = {};
                    newRec[dbInfo.idField] = record;
                    data.record.push(newRec);
                });
                break;
            case "data_record_object":
                data = {};
                data[dbInfo.idField] = ids[0];
                break;
            case "data_idlist_array":
                data = {
                    "ids": ids
                };
                break;
            case "data_idlist_string":
                data = {
                    "ids": ids.join(",")
                };
                break;
            case "param_idlist_string":
                queryParams = "&ids=" + ids.join(",");
                break;
            case "url_id":
                url += "/" + ids[0];
                break;
            default:
                throw "Bad method=" + method;
        }
    }
    var reqType = (data === null ? "GET" :"POST");
    if (reqType !== "GET") {
        queryParams += "&method=GET";
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "reqType":reqType, "url":url, "method":method};
}

function getParamsByFilter(name, method, filter) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    if (filter.cond.length > 0) {
        switch (method) {
            case "data_filter":
                data = {
                    "filter": ""
                };
                $.each(filter.cond, function(index, c) {
                    if (data.filter != "") {
                        data.filter += " " + filter.logic + " ";
                    }
                    data.filter += c.field + c.op + c.value;
                });
                break;
            case "data_filter_replace":
                data = {
                    "filter": "",
                    "params": {}
                };
                $.each(filter.cond, function(index, c) {
                    if (data.filter != "") {
                        data.filter += " " + filter.logic + " ";
                    }
                    data.filter += c.field + c.op + ":value" + index;
                    data.params[":value" + index] = c.value;
                });
                break;
            case "param_filter":
                $.each(filter.cond, function(index, c) {
                    if (queryParams != "") {
                        queryParams += " " + filter.logic + " ";
                    }
                    queryParams += c.field + c.op + c.value;
                });
                queryParams = "&filter=" + encodeURIComponent(queryParams);
                break;
            case "param_filter_replace":
                data = {
                    "params": {}
                };
                $.each(filter.cond, function(index, c) {
                    if (queryParams != "") {
                        queryParams +=  " " + filter.logic + " ";
                    }
                    queryParams += c.field + c.op + ":value" + index;
                    data.params[":value" + index] = c.value;
                });
                queryParams = "&filter=" + encodeURIComponent(queryParams);
                break;
            default:
                throw "Bad method=" + method;
        }
    }
    var reqType = (data === null ? "GET" :"POST");
    if (reqType !== "GET") {
        queryParams += "&method=GET";
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "reqType":reqType, "url":url, "method":method};
}

function getRecords(params) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: params.reqType,
        dataType: 'json',
        contentType:'application/json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: params.data ? JSON.stringify(params.data) : null,
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function updateParamsByIds(name, method, newData, indices) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    var ids = getIdArray(name, indices);
    switch (method) {
        case "data_record_batch":
            data = newData;
            break;
        case "data_record_array":
            data = {"record": []};
            $.each(ids, function(index, record) {
                var rec = cloneObject(newData);
                rec[dbInfo.idField] = record;
                data.record.push(rec);
            });
            break;
        case "data_record_object":
            data = newData;
            data[dbInfo.idField] = ids[0];
            break;
        case "data_idlist_array":
            data = {
                "ids": ids,
                "record": newData
            };
            break;
        case "data_idlist_string":
            data = {
                "ids": ids.join(","),
                "record": newData
            };
            break;
        case "param_idlist_string":
            queryParams = "&ids=" + ids.join(",");
            data = {
                "record": newData
            };
            break;
        case "url_id":
            url += "/" + ids[0];
            data = newData;
            break;
        default:
            throw "Bad method=" + method;
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function updateParamsByFilter(name, method, newData, filter) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    switch (method) {
        case "data_filter":
            data = {
                "filter": "",
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + c.value;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {},
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            break;
        case "param_filter":
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            data = {
                "record": newData
            };
            break;
        case "param_filter_replace":
            data = {
                "params": {},
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        default:
            throw "Bad method=" + method;
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function updateRecords(params) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: params.put ? "PUT" : "PATCH",
        dataType: 'json',
        contentType:'application/json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function deleteParamsByIds(name, method, indices) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    var ids = getIdArray(name, indices);
    switch (method) {
        case "data_record_array":
            data = {"record": []};
            $.each(ids, function(index, record) {
                var newRec = {};
                newRec[dbInfo.idField] = record;
                data.record.push(newRec);
            });
            break;
        case "data_idlist_array":
            data = {"ids": ids};
            break;
        case "data_idlist_string":
            data = {"ids": ids.join(",")};
            break;
        case "param_idlist_string":
            queryParams = "&ids=" + ids.join(",");
            break;
        case "url_id":
            url += "/" + ids[0];
            break;
        default:
            throw "Bad method=" + method;
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function deleteParamsByFilter(name, method, filter) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/" + name;
    switch (method) {
        case "data_filter":
            data = {"filter": ""};
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + c.value;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {}
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            break;
        case "param_filter":
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        case "param_filter_replace":
            data = {
                "params": {}
            };
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        default:
            throw "Bad method=" + method;
    }
    if (dbInfo.idType) {
        queryParams += "&id_type=" + dbInfo.idType;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function deleteRecords(params) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType: 'json',
        contentType:'application/json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function createTable(name) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/' + dbInfo.dbService + '/_schema',
        data: getSchema(name),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function tableExists(name) {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/' + dbInfo.dbService + "/_schema/" + name,
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result.data !== null;
}

function deleteTable(name) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/' + dbInfo.dbService + '/_schema/' + name,
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
            createdRecords[name] = [];
            recordCounts[name] = 0;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function truncateLocalTable(name) {

    var result = {"rawError":null, "error":null, "data":null};

    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        contentType:'application/json',
        //url: hostUrl + "/rest/db/" + name + "?force=true",
        url: hostUrl + "/rest/db/" + name + "?filter=id!%3D0",
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });

    return result;
}

// drop table for configured service

function truncateTable(name) {

    var result = {"rawError":null, "error":null, "data":null};

    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        contentType:'application/json',
        //url: hostUrl + "/rest/" + dbInfo.dbService + "/" + name + "?force=true",
        url: hostUrl + "/rest/" + dbInfo.dbService + "/" + name + "?filter=id!%3D0",
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
            createdRecords[name] = [];
            recordCounts[name] = 0;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });

    return result;
}

function getSchema(name) {

    var result = {
        "table": []
    };
    var length = testSchema.table.length;
    for (var i = 0; i < length; i++) {
        if (testSchema.table[i].name === name) {
            result.table.push(testSchema.table[i]);
        }
    }
    return JSON.stringify(result);
}

function createUsers() {

    var data = {"record":[]};
    for (i = 0; i < 2; i++) {
        data.record.push(
            {
                "email": "testuser" + (i + 1) + "@dreamfactory.com",
                "display_name": "Test User " + (i + 1),
                "first_name": "Test",
                "last_name": "User",
                "confirmed": true,
                "is_active": true,
                "is_sys_admin": false,
                "password": "slimjim",
                "lookup_keys": [
                    {
                     "name": "mincurr",
                     "value": i ? 1000 : 0
                    },
                    {
                        "name": "maxcurr",
                        "value": i ? 2000 : 1000
                    }
                ]
            }
        );
    }
    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/user?fields=*',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getUsers() {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/user?filter=email%20like%20%27%25testuser%25%27',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function deleteUsers() {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/user',
        data:JSON.stringify(userData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function createRoles() {

    var data = {"record":[]};

    for (i = 0; i < 2; i++) {
        data.record.push(
            {
                "name": "testrole" + (i + 1),
                "is_active": true,
                "users": {"record": userData.record[i]},
                "apps": appData.record,
                "role_service_accesses": [
                    {
                        "verbs": ["GET","POST","PUT","PATCH","MERGE","DELETE"],
                        "component": "testobject",
                        "service_id": serviceData.record[0].id,
                        "filters": [],
                        "filter_op": "AND"
                    }
                ],
                "role_system_accesses": [],
                "lookup_keys":[]
            }
        );
    }

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/role?fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getRoles() {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/role?filter=name%20like%20%27%25testrole%25%27&fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function updateRoles(mode) {

    for (i = 0; i < 2; i++) {
        switch (mode) {
            case "number":
                var data = [
                    {
                        "name": "curr",
                        "operator": ">=",
                        "value": i ? 1000 : 0
                    },
                    {
                        "name": "curr",
                        "operator": "<",
                        "value": i ? 2000 : 1000
                    }
                ];
                break;
            case "string":
            case "picklist":
                var data = [
                    {
                        "name": "str",
                        "operator": "=",
                        "value": i ? "medium" : "small"
                    }
                ];
                break;
            case "lookup":
                var data = [
                    {
                        "name": "curr",
                        "operator": ">=",
                        "value": "{mincurr}"
                    },
                    {
                        "name": "curr",
                        "operator": "<",
                        "value": "{maxcurr}"
                    }
                ];
                break;
            case "ownerid":
                var data = [
                    {
                        "name": "OwnerId",
                        "operator": "=",
                        "value": "{user.id}"
                    }
                ];
                break;
            default:
                throw "bad mode=" + mode;
        }
        roleData.record[i].role_service_accesses[0].filters = data;
    }

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'PATCH',
        dataType:'json',
        url: hostUrl + '/rest/system/role?fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        data:JSON.stringify(roleData),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function deleteRoles() {

    var result = {"rawError":null, "error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/role',
        data:JSON.stringify(roleData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
	return result;
}

function getServices(num) {

    var result = {"rawError":null, "error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        dataType:'json',
        contentType:'application/json',
        url: hostUrl + '/rest/system/service?filter=api_name%3D%27' + dbInfo.dbService + '%27',
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function setHeaders(request)
{
    if (sessionData) {
        request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
    }
    request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
}