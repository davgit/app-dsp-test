var testSchema = {
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
                    "name": "pick",
                    "label": "pick",
                    "type": "string",
                    "validation": "picklist",
                    "value": [
                        "small", "medium", "large"
                    ]
                },
                {
                    "name": "str",
                    "label": "str",
                    "type": "string",
                    "length": 40
                },
                {
                    "name": "curr",
                    "label": "curr",
                    "type": "money",
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
};