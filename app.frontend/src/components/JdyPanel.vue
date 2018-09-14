<template>
    <v-form ref="form" lazy-validation>
        <div v-for="(formfield,index) in formFields" :key="index">
            <jdy-primitive :selectedItem="selectedItem" :primitiveAttribute="formfield.attr"></jdy-primitive>
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

    props: ['selectedItem', 'classinfo'],
    data () {
        return {
            formFields: []
        };
    },
    computed: {},
    methods: {

        getItemValue: function (value) {
            const result = this.selectedItem ? value(this.selectedItem) : null;
            return result;
        },
        updateItemValue: function (value, newValue) {
            if (this.selectedItem) {
                console.log('Selected Item ' + this.selectedItem + '!');
                console.log('Value ' + value + '!');
                console.log('New Value ' + newValue + '!');
                this.selectedItem[value] = newValue;
            }
        }
    },
    watch: {
        classinfo: function (newClassInfo) {
            console.log(newClassInfo); // test
            if (newClassInfo) {
                this.formFields = convertToFields(newClassInfo);
            } else {
                this.formFields = undefinedColumns;
            }
        }
    }
};
</script>
