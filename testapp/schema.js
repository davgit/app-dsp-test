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
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name": "CreatedDate",
                    "label": "Created Date",
                    "type": "timestamp_on_create",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name": "LastModifiedById",
                    "label": "Last Modified By ID",
                    "type": "user_id_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name": "LastModifiedDate",
                    "label": "Last Modified Date",
                    "type": "timestamp_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name": "OwnerId",
                    "label": "OwnerID",
                    "type": "user_id",
                    "allow_null": false
                }
            ]
        },
        {
            "description": "The main table for tracking contacts.",
            "name":        "contact",
            "field":       [
                {
                    "name":  "id",
                    "label": "Contact Id",
                    "type":  "id"
                },
                {
                    "name":       "first_name",
                    "type":       "string",
                    "size":       40,
                    "allow_null": false,
                    "is_index":   true,
                    "validation": {
                        "not_empty": {
                            "on_fail": "First name value must not be empty."
                        }
                    }
                },
                {
                    "name":       "last_name",
                    "type":       "string",
                    "allow_null": false,
                    "is_index":   true,
                    "size":       40
                },
                {
                    "name":       "display_name",
                    "type":       "string",
                    "size":       80,
                    "allow_null": false,
                    "is_unique":  true,
                    "validation": {
                        "not_empty": {
                            "on_fail": "Display name value must not be empty."
                        }
                    }
                },
                {
                    "name": "birth_date",
                    "type": "datetime"
                },
                {
                    "name": "origin",
                    "type": "string"
                },
                {
                    "name": "last_contact",
                    "type": "datetime"
                },
                {
                    "name":       "reports_to",
                    "type":       "reference",
                    "ref_table":  "contact",
                    "ref_fields": "id"
                },
                {
                    "name":       "active",
                    "type":       "boolean",
                    "allow_null": false,
                    "default":    true
                },
                {
                    "name":       "rating",
                    "type":       "integer",
                    "validation": {
                        "int": {
                            "on_fail": "Value not in the range of 0 to 10.",
                            "range":   {
                                "min": 0,
                                "max": 10
                            }
                        }
                    }
                },
                {
                    "name": "test_float",
                    "type": "float"
                },
                {
                    "name": "test_double",
                    "type": "double"
                },
                {
                    "name":      "test_decimal",
                    "type":      "decimal",
                    "precision": 10,
                    "scale":     2
                },
                {
                    "name": "amount_owed",
                    "type": "money"
                },
                {
                    "name": "amount_loaned",
                    "type": "money"
                },
                {
                    "name":       "imageUrl",
                    "label":      "imageUrl",
                    "type":       "text",
                    "validation": {
                        "url": {
                            "on_fail": "Not a valid URL value."
                        }
                    }
                },
                {
                    "name":  "notes",
                    "label": "notes",
                    "type":  "text"
                },
                {
                    "name":       "created_date",
                    "label":      "Created On",
                    "type":       "timestamp_on_create",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "last_modified_date",
                    "label":      "Last Modified On",
                    "type":       "timestamp_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "created_by_id",
                    "label":      "Created By",
                    "type":       "user_id_on_create",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "last_modified_by_id",
                    "label":      "Last Modified By",
                    "type":       "user_id_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                }
            ]
        },
        {
            "description": "The contact details sub-table, owned by contact table row.",
            "name":        "contact_info",
            "field":       [
                {
                    "name":  "id",
                    "label": "Info Id",
                    "type":  "id"
                },
                {
                    "name": "ordinal",
                    "type": "integer"
                },
                {
                    "name":          "contact_id",
                    "type":          "reference",
                    "allow_null":    false,
                    "ref_table":     "contact",
                    "ref_fields":    "id",
                    "ref_on_delete": "CASCADE"
                },
                {
                    "name":       "info_type",
                    "type":       "string",
                    "size":       32,
                    "allow_null": false,
                    "validation": {
                        "not_empty": {
                            "on_fail": "Information type can not be empty."
                        },
                        "picklist":  {
                            "on_fail": "Not a valid information type."
                        }
                    },
                    "value":      [ "work", "home", "mobile", "other"]
                },
                {
                    "name":  "phone",
                    "label": "Phone Number",
                    "type":  "string",
                    "size":  32
                },
                {
                    "name":       "email",
                    "label":      "Email Address",
                    "type":       "string",
                    "size":       255,
                    "validation": {
                        "email": {
                            "on_fail": "Not a valid email address."
                        }
                    }
                },
                {
                    "name":  "twitter",
                    "label": "Twitter Handle",
                    "type":  "string",
                    "size":  18
                },
                {
                    "name":  "skype",
                    "label": "Skype Account",
                    "type":  "string",
                    "size":  255
                },
                {
                    "name":       "website",
                    "type":       "text",
                    "validation": {
                        "url": {
                            "on_fail": "Not a valid URL value."
                        }
                    }
                },
                {
                    "name":  "address",
                    "label": "Street Address",
                    "type":  "string"
                },
                {
                    "name":  "city",
                    "label": "city",
                    "type":  "string",
                    "size":  64
                },
                {
                    "name":  "state",
                    "label": "state",
                    "type":  "string",
                    "size":  64
                },
                {
                    "name":  "zip",
                    "label": "zip",
                    "type":  "string",
                    "size":  16
                },
                {
                    "name":  "country",
                    "label": "country",
                    "type":  "string",
                    "size":  64
                }
            ]
        },
        {
            "description": "The main table for tracking groups of contact.",
            "name":        "contact_group",
            "field":       [
                {
                    "name": "id",
                    "type": "id"
                },
                {
                    "name":       "name",
                    "type":       "string",
                    "size":       128,
                    "allow_null": false,
                    "validation": {
                        "not_empty": {
                            "on_fail": "Group name value must not be empty."
                        }
                    }
                },
                {
                    "name": "description",
                    "type": "text"
                },
                {
                    "name":       "created_date",
                    "label":      "Created On",
                    "type":       "timestamp_on_create",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "last_modified_date",
                    "label":      "Last Modified On",
                    "type":       "timestamp_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "created_by_id",
                    "label":      "Created By",
                    "type":       "user_id_on_create",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                },
                {
                    "name":       "last_modified_by_id",
                    "label":      "Last Modified By",
                    "type":       "user_id_on_update",
                    "validation": {
                        "api_read_only": {
                            "on_fail": "ignore_field"
                        }
                    }
                }
            ]
        },
        {
            "description": "The join table for tracking contacts in groups.",
            "name":        "contact_group_relationship",
            "field":       [
                {
                    "name": "id",
                    "type": "id"
                },
                {
                    "name":          "contact_id",
                    "type":          "reference",
                    "allow_null": false,
                    "ref_table":     "contact",
                    "ref_fields":    "id",
                    "ref_on_delete": "CASCADE"
                },
                {
                    "name":          "contact_group_id",
                    "type":          "reference",
                    "allow_null": false,
                    "ref_table":     "contact_group",
                    "ref_fields":    "id",
                    "ref_on_delete": "CASCADE"
                }
            ]
        },
        {
            "description": "The join table for tracking associated contacts.",
            "name":        "associated_contact",
            "field":       [
                {
                    "name": "id",
                    "type": "id"
                },
                {
                    "name":          "contact_id",
                    "type":          "reference",
                    "allow_null": false,
                    "ref_table":     "contact",
                    "ref_fields":    "id",
                    "ref_on_delete": "CASCADE"
                },
                {
                    "name":       "associated_id",
                    "type":       "reference",
                    "allow_null": false,
                    "ref_table":  "contact",
                    "ref_fields": "id"
                },
                {
                    "name":       "relationship",
                    "type":       "string",
                    "value":      ["relative", "coworker", "friend", "church", "neighbor", "hobby", "other"],
                    "validation": {
                        "multi_picklist": {
                            "delimiter": ",",
                            "max":       3
                        }
                    }
                },
                {
                    "description": "More detail on relationship values..",
                    "name":        "detail",
                    "type":        "text"
                }
            ]
        }
    ]
}
