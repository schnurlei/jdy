<template>
    <v-form ref="form" lazy-validation>
        <div v-for="(formfield,index) in formFields" :key="index">
            <jdy-primitive :selectedItem="editedItem" :primitiveAttribute="formfield.attr"></jdy-primitive>
        </div>
    </v-form>
</template>

<script>

function primitiveTypeToColumnHandler (attrInfo) {
    return {
        handleBoolean: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleDecimal: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleTimeStamp: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleFloat: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleLong: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleText: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleVarChar: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        },

        handleBlob: function (aType) {
            return {attr: attrInfo, text: attrInfo.getInternalName(), value: item => item[attrInfo.getInternalName()]};
        }
    };
};

function convertToFields (classInfo) {
    const allFields = [];
    classInfo.forEachAttr(attrInfo => {
        if (attrInfo.isPrimitive()) {
            let newField = attrInfo.getType().handlePrimitiveKey(primitiveTypeToColumnHandler(attrInfo));
            if (newField) {
                allFields.push(newField);
            }
        }
    });
    return allFields;
};

export default {

    props: ['editedItem', 'classinfo'],
    data () {
        return {
            formFields: []
        };
    },
    computed: {},
    methods: {

        getItemValue: function (value) {
            const result = this.editedItem ? value(this.editedItem) : null;
            return result;
        },
        updateItemValue: function (value, newValue) {
            if (this.editedItem) {
                this.editedItem[value] = newValue;
            }
        }
    },
    watch: {
        classinfo: function (newClassInfo) {
            if (newClassInfo) {
                this.formFields = convertToFields(newClassInfo);
            } else {
                this.formFields = undefinedColumns;
            }
        }
    }
};
</script>
