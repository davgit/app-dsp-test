function getErrorObject(response) {

    var value = null;
    var result = null;

    if (response) {
        value = response.responseText;
        if (value) {
            try {
                result = JSON.parse(value);
            } catch(e) {

            }
        } else {
            result = response.data;
        }
    }
    return result;
}

function getErrorString(response) {

    var value = null;
    var result = null;

    if (response) {
        value = response.status;
        if (value) {
            code = value;
        }
        result = getErrorObject(response);
        if (result && result.error) {
            value = "";
            $.each(result.error, function (index, err) {
                // get top level error
                value += "code " + err.code;
                value += ": ";
                value += xml2text(err.message);
                var context = err.context;
                if (context && context.error) {
                    // get error string for each errored index
                    value += "\r";
                    $.each(context.error, function (i, errIndex) {
                        value += "index " + errIndex + ": " + xml2text(context.record[errIndex]) + "\r";
                    });
                }
            });
            if (value) {
                return value;
            }
        }
    }
    return 'Server returned an unknown error.';
}

function text2xml(value) {

    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\'/g, '&apos;');
}

function xml2text(value) {

    return value.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&apos;/g, '\''); ;
}

function crudError(response) {

    alert(getErrorString(response));
}

function getIdArray(name, indexArray) {

    var result = [];
    $.each(indexArray, function(index, value) {
        id = createdRecords[name][value][dbInfo.idField];
        result.push(id);
    });
    return result;
}

function formatFilterId(id) {

    if (dbInfo.idType === "string") {
        id = "'" + id + "'";
    }
    return id;
}

function formatJsonId(id) {

    if (dbInfo.idType === "string") {
        return id.toString();
    }
    return id;
}

function idFilter(name, values) {

    var ids = getIdArray(name, values);
    return makeFilter(dbInfo.idField, "=", ids, "or");
}

function makeFilter(field, op, values, logic) {

    var filter = {"cond": [], "logic": logic};
    $.each(values, function(index, value) {
        filter.cond.push({"field": field, "op": op, "value": formatFilterId(value)});
    });
    return filter;
}

function checkResult(cond, desc, result) {

    if (!cond) {
        console.log("(" + ++testCounter + ") " + desc + " FAILED ");
        if (result) {
            console.log(result);
        }
        throw "Assertion failed";
    }
    console.log("(" + ++testCounter + ") " + desc + " OK ");
}

function cloneObject(object) {

    return JSON.parse(JSON.stringify(object));
}