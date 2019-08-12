<template>
    <v-form ref="form" lazy-validation>
        <div v-for="(formfield,index) in formFields" :key="index">
            <jdy-primitive :selectedItem="editedItem" :primitiveAttribute="formfield.attr"></jdy-primitive>
        </div>
        <template v-if="formAssocs.length > 0">
            <v-tabs background-color="#b3d4fc">
                <v-tab  v-for="(assoc,index2) in formAssocs"  :key="index2">
                    {{ assoc.getAssocName () }}
                </v-tab>
                    <v-tab-item v-for="(assocItem,index3) in formAssocs"  :key="index3">
                        <jdy-detail-table :associationInfo="assocItem" :editedItem="editedItem" ></jdy-detail-table>
                    </v-tab-item>
            </v-tabs>
        </template>
    </v-form>
</template>

<script>

function convertToFields (classInfo) {
    const allFields = [];
    classInfo.forEachAttr(attrInfo => {
        if (attrInfo.isPrimitive()) {
            allFields.push({attr: attrInfo});
        }
    });
    return allFields;
};

export default {

    props: ['editedItem', 'classinfo'],
    data () {
        return {
        };
    },
    computed: {
        formFields() {

            let fieldsFromClassInfo= [];
            if (this.classinfo) {
                fieldsFromClassInfo = convertToFields(this.classinfo);
            }

            return fieldsFromClassInfo;
        },
        formAssocs() {

            let assocsFromClassnfo = [];
            if (this.classinfo) {
                this.classinfo.forEachAssoc(assocInfo => {
                    assocsFromClassnfo.push(assocInfo);
                });
            }
            return assocsFromClassnfo;
        }
    },
    methods: {
    }
};
</script>
