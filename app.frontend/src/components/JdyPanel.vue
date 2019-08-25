<template>
    <v-form ref="form" lazy-validation>
        <div v-for="(formfield,index) in formFields" :key="index">
            <jdy-primitive :selectedItem="editedItem" :primitiveAttribute="formfield"></jdy-primitive>
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

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyAssociationModel, JdyAttributeInfo, JdyClassInfo} from "@/js/jdy/jdy-base";

    function convertToFields (classInfo) {
        const allFields: JdyAttributeInfo[] = [];
        classInfo.forEachAttr(attrInfo => {
            if (attrInfo.isPrimitive()) {
                allFields.push(attrInfo);
            }
        });
        return allFields;
    }

    @Component( {
        name: 'JdyPanel',
        components: {
        }
    })
    export default class JdyPanel extends Vue {

    @Prop({default: null}) classinfo: JdyClassInfo | null | undefined;
    @Prop() editedItem;

     get formFields() {

        let fieldsFromClassInfo: JdyAttributeInfo[]= [];
        if (this.classinfo) {
            fieldsFromClassInfo = convertToFields(this.classinfo);
        }

        return fieldsFromClassInfo;
    }

     get formAssocs() {

        let assocsFromClassnfo: JdyAssociationModel[] = [];
        if (this.classinfo) {
            this.classinfo.forEachAssoc(assocInfo => {
                assocsFromClassnfo.push(assocInfo);
            });
        }
        return assocsFromClassnfo;
    }
};
</script>
