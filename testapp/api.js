var createdRecords;

function initApi() {

    createdRecords = [];
}

function login(params) {

    var result = {"error":null, "data":null};
	$.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'POST',
		dataType:'json',
        url: hostUrl + '/rest/user/session',
        data: JSON.stringify(params.data),
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
			result.error = getErrorString(response);
        }
    });
	return result;
}

function logout() {

    var result = {"error":null, "data":null};
	$.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/user/session',
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
    return result;
}

function getApps() {

    var result = {"error":null, "data":null};
    $.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        dataType:'json',
        url: hostUrl + '/rest/system/app',
        cache:false,
        async: false,
		success:function (response) {
		    result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function createParams(method, data) {

    params = "fields=*";
    return {"data":data, "params":params, "method":method};
}

function createRecords(params) {

    var result = {"error":null, "rawError": null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'POST',
        dataType:  'json',
        url: hostUrl + "/rest/" + dbInfo.dbService + "/testobject?" + params.params,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
            switch (params.method) {
                case "data_record_array":
                    $.each(response.record, function(index, record) {
                        createdRecords.push(record);
                    });
                    break;
                case "data_record_object":
                    createdRecords.push(response);
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

function getParams(method, indexArray) {

    var data = null;
    var params = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indexArray);
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
                data[dbInfo.idField] = ids.join(",");
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
            case "data_filter":
                data = {
                    "filter": ""
                };
                $.each(ids, function(index, record) {
                    if (data.filter != "") {
                        data.filter += " or ";
                    }
                    data.filter += dbInfo.idField + "=" + record;
                });
                break;
            case "data_filter_replace":
                data = {
                    "filter": "",
                    "params": {}
                };
                $.each(ids, function(index, record) {
                    if (data.filter != "") {
                        data.filter += " or ";
                    }
                    data.filter += dbInfo.idField + "=:id" + index;
                    data.params[":id" + index] = record;
                });
                break;
            case "param_idlist_string":
                params = "&ids=" + ids.join(",");
                break;
            case "param_filter":
                params = "";
                $.each(ids, function(index, record) {
                    if (params != "") {
                        params += " or ";
                    }
                    params += dbInfo.idField + "=" + record;
                });
                params = "&filter=" + params;
                break;
            case "param_filter_replace":
                data = {
                    "params": {}
                };
                params = "";
                $.each(ids, function(index, record) {
                    if (params != "") {
                        params += " or ";
                    }
                    params += dbInfo.idField + "=:id" + index;
                    data.params[":id" + index] = record;
                });
                params = "&filter=" + params;
                break;
            case "url_id":
                url += "/" + ids.join(",");
                break;
            default:
                throw "Bad method=" + method;
        }
    }
    var reqType = (data === null ? "GET" :"POST");
    if (reqType !== "GET") {
        params += "&method=GET";
    }
    return {"data":data, "params":params, "reqType":reqType, "url":url, "method":method};
}

function getRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: params.reqType,
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.params,
        data: params.data ? JSON.stringify(params.data) : null,
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function updateParams(method, indexArray) {

    var data = null;
    var params = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indexArray);
    switch (method) {
        case "data_record_array":
            data = {"record": []};
            $.each(ids, function(index, record) {
                var newRec = {"updated": true};
                newRec[dbInfo.idField] = record;
                data.record.push(newRec);
            });
            break;
        case "data_record_object":
            data = {"updated": true};
            data[dbInfo.idField] = ids.join(",");
            break;
        case "data_idlist_array":
            data = {
                "ids": ids,
                "record": {"updated": true}
            };
            break;
        case "data_idlist_string":
            data = {
                "ids": ids.join(","),
                "record": {"updated": true}
            };
            break;
        case "data_filter":
            data = {
                "filter": "",
                "record": {"updated": true}
            };
            $.each(ids, function(index, record) {
                if (data.filter != "") {
                    data.filter += " or ";
                }
                data.filter += dbInfo.idField + "=" + record;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {},
                "record": {"updated": true}
            };
            $.each(ids, function(index, record) {
                if (data.filter != "") {
                    data.filter += " or ";
                }
                data.filter += dbInfo.idField + "=:id" + index;
                data.params[":id" + index] = record;
            });
            break;
        case "param_idlist_string":
            params = "&ids=" + ids.join(",");
            data = {
                "record": {"updated": true}
            };
            break;
        case "param_filter":
            params = "";
            $.each(ids, function(index, record) {
                if (params != "") {
                    params += " or ";
                }
                params += dbInfo.idField + "=" + record;
            });
            params = "&filter=" + params;
            data = {
                "record": {"updated": true}
            };
            break;
        case "param_filter_replace":
            data = {
                "params": {},
                "record": {"updated": true}
            };
            params = "";
            $.each(ids, function(index, record) {
                if (params != "") {
                    params += " or ";
                }
                params += dbInfo.idField + "=:id" + index;
                data.params[":id" + index] = record;
            });
            params = "&filter=" + params;
            break;
        case "url_id":
            url += "/" + ids.join(",");
            data = {
                "record": {"updated": true}
            };
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "params":params, "url":url, "method":method};
}

function updateRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'PATCH',
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.params,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function deleteParams(method, indexArray) {

    var data = null;
    var params = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indexArray);
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
            data[dbInfo.idField] = ids.join(",");
            break;
        case "data_idlist_array":
            data = {"ids": ids};
            break;
        case "data_idlist_string":
            data = {"ids": ids.join(",")};
            break;
        case "data_filter":
            data = {"filter": ""};
            $.each(ids, function(index, record) {
                if (data.filter != "") {
                    data.filter += " or ";
                }
                data.filter += dbInfo.idField + "=" + record;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {}
            };
            $.each(ids, function(index, record) {
                if (data.filter != "") {
                    data.filter += " or ";
                }
                data.filter += dbInfo.idField + "=:id" + index;
                data.params[":id" + index] = record;
            });
            break;
        case "param_idlist_string":
            params = "&ids=" + ids.join(",");
            break;
        case "param_filter":
            params = "";
            $.each(ids, function(index, record) {
                if (params != "") {
                    params += " or ";
                }
                params += dbInfo.idField + "=" + record;
            });
            params = "&filter=" + params;
            break;
        case "param_filter_replace":
            data = {
                "params": {}
            };
            params = "";
            $.each(ids, function(index, record) {
                if (params != "") {
                    params += " or ";
                }
                params += dbInfo.idField + "=:id" + index;
                data.params[":id" + index] = record;
            });
            params = "&filter=" + params;
            break;
        case "url_id":
            url += "/" + ids.join(",");
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "params":params, "url":url, "method":method};
}

function deleteRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'DELETE',
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.params,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function createTable() {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/' + dbInfo.schemaService,
        data: getSchema(),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function tableExists(name) {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        dataType:'json',
        url: hostUrl + '/rest/' + dbInfo.dbService + "?names=" + name,
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result.data !== null;
}

function deleteTable() {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'DELETE',
        dataType:'json',
        url: serviceData.record[0].type === 'NoSQL DB' ?
            hostUrl + '/rest/' + dbInfo.schemaService + '?names=testobject' :
            hostUrl + '/rest/' + dbInfo.schemaService + '/testobject',
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
            createdRecords = [];
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getSchema() {

    return JSON.stringify(
        {
            "table": [
                {
                    "name": "testobject",
                    "label": "TestObject",
                    "plural": "TestObjects",
                    "field": [
                        {
                            "name": "id",
                            "label": "Id",
                            "type": "id"
                        },
                        {
                            "name": "name",
                            "label": "Name",
                            "type": "string",
                            "size": 80,
                            "allow_null": false
                        },
                        {
                            "name": "bool",
                            "label": "bool",
                            "type": "boolean"
                        },
                        {
                            "name": "updated",
                            "label": "updated",
                            "type": "boolean"
                        },
                        {
                            "name":       "pick",
                            "label":      "pick",
                            "type":       "string",
                            "validation": "picklist",
                            "values":     [
                                "New", "In Process", "Closed"
                            ]
                        },
                        {
                            "name":   "str",
                            "label":  "str",
                            "type":   "string",
                            "length": 40
                        },
                        {
                            "name":     "curr",
                            "label":    "curr",
                            "type":     "money",
                            "decimals": 0
                        },
                        {
                            "name": "CreatedById",
                            "label": "Created By ID",
                            "type": "user_id_on_create",
                            "api_read_only": true
                        },
                        {
                            "name": "CreatedDate",
                            "label": "Created Date",
                            "type": "timestamp_on_create",
                            "api_read_only": true
                        },
                        {
                            "name": "LastModifiedById",
                            "label": "Last Modified By ID",
                            "type": "user_id_on_update",
                            "api_read_only": true
                        },
                        {
                            "name": "LastModifiedDate",
                            "label": "Last Modified Date",
                            "type": "timestamp_on_update",
                            "api_read_only": true
                        },
                        {
                            "name": "OwnerId",
                            "label": "OwnerID",
                            "type": "reference",
                            "ref_table": "df_sys_user",
                            "ref_field": "Id",
                            "allow_null": false
                        }
                    ]
                }
            ]
        });
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
                "password": "slimjim"
            }
        );
    }
    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/system/user?fields=email',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getUsers() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        dataType:'json',
        url: hostUrl + '/rest/system/user?filter=email%20like%20%27%25testuser%25%27',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function deleteUsers() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/system/user',
        data:JSON.stringify(userData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function createRoles(type) {

    var data = {"record":[]};
    if (type === "ownerid") {
        data.record.push(
            {
                "name": "testrole0",
                "is_active": true,
                "users": {"record": userData.record[0]},
                "apps": appData.record,
                "role_service_accesses": [
                    {
                        "access": "Full Access",
                        "component": "testobject",
                        "service_id": serviceData.record[0].id,
                        "filters": [
                            {
                                "name": "OwnerId",
                                "operator": "=",
                                "value": "user.id"
                            }
                        ],
                        "filter_op": "AND"
                    }
                ],
                "role_system_accesses": [],
                "lookup_keys":[]
            }
        );
        data.record.push(
            {
                "name": "testrole1",
                "is_active": true,
                "users": {"record": userData.record[1]},
                "apps": appData.record,
                "role_service_accesses": [
                    {
                        "access": "Full Access",
                        "component": "testobject",
                        "service_id": serviceData.record[0].id,
                        "filters": [
                            {
                                "name": "OwnerId",
                                "operator": "=",
                                "value": "user.id"
                            }
                        ],
                        "filter_op": "AND"
                    }
                ],
                "role_system_accesses": [],
                "lookup_keys":[]
            }
        );
    } else {
        data.record.push(
            {
                "name": "testrole0",
                "is_active": true,
                "users": {"record": userData.record[0]},
                "apps": appData.record,
                "role_service_accesses": [
                    {
                        "access": "Full Access",
                        "component": "testobject",
                        "service_id": serviceData.record[0].id,
                        "filters": [
                            {
                                "name": "curr",
                                "operator": "<",
                                "value": 100000
                            }
                        ],
                        "filter_op": "AND"
                    }
                ],
                "role_system_accesses": [],
                "lookup_keys":[]
            }
        );
        data.record.push(
            {
                "name": "testrole1",
                "is_active": true,
                "users": {"record": userData.record[1]},
                "apps": appData.record,
                "role_service_accesses": [
                    {
                        "access": "Full Access",
                        "component": "testobject",
                        "service_id": serviceData.record[0].id,
                        "filters": [
                            {
                                "name": "curr",
                                "operator": ">=",
                                "value": 100000
                            },
                            {
                                "name": "curr",
                                "operator": "<",
                                "value": 1000000
                            }
                        ],
                        "filter_op": "AND"
                    }
                ],
                "role_system_accesses": [],
                "lookup_keys":[]
            }
        );
    }
    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/system/role?fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getRoles() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        dataType:'json',
        url: hostUrl + '/rest/system/role?filter=name%20like%20%27%25testrole%25%27&fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function deleteRoles() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: function (request)
            {
                request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
                request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
            },
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/system/role',
        data:JSON.stringify(roleData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function getServices(num) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: function (request)
        {
            request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
            request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
        },
        dataType:'json',
        url: hostUrl + '/rest/system/service?filter=api_name%3D%27' + dbInfo.dbService + '%27',
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}