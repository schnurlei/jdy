<template>
    <div>
        <v-snackbar v-model="showMessage" color='error' :top='true' :multi-line=true :timeout='6000' >
            {{ errorMessage }}
            <v-btn dark text @click="showMessage = false"> Close </v-btn>
        </v-snackbar>
        <jdy-table :items="holderItems" :columns="columns" :classinfo="classInfo"></jdy-table>
    </div>
</template>

<script  lang='ts'>

import {Prop, Vue, Watch} from 'vue-property-decorator';
import Component from 'vue-class-component';

@Component( {
    name: 'JdyDetailTableHolder',
    components: {
    }
})
export default class JdyDetailTableHolder extends Vue {

    @Prop() associationInfo;
    @Prop() editedItem;
    readonly undefinedColumns = [{
            text: '#Undefined',
            left: true,
            sortable: false
        }
        ];
    readonly undefinedData = [
    ];

    showMessage = false;
    errorMessage = '';

    get columns() {
        return (this.associationInfo) ? this.convertToColumns(this.associationInfo.getDetailClass ()) : this.undefinedColumns;
    }

    get classInfo() {
        return (this.associationInfo) ? this.associationInfo.getDetailClass () : null;
    }

    get holderItemsList() {
        return (this.associationInfo && this.editedItem && this.editedItem.assocVals)
            ? this.editedItem.assocVals(this.associationInfo)
            : this.undefinedData;
    }

    get holderItems() {
        return (this.associationInfo && this.editedItem && this.editedItem.assocVals)
            ? this.editedItem.assocVals(this.associationInfo).getObjects()
            : this.undefinedData;
    }

    primitiveTypeToColumnHandler (attrInfo) {
        return {
            handleBoolean: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName(),
                    left: true
                };
            },

            handleDecimal: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName()
                };
            },

            handleTimeStamp: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName()
                };
            },

            handleFloat: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName()
                };
            },

            handleLong: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName()
                };
            },

            handleText: function (aType) {
                return {
                    text: attrInfo.getInternalName(),
                    align: 'left',
                    value: attrInfo.getInternalName(),
                    left: true
                };
            },

            handleVarChar: function (aType) {
                return null;
            },

            handleBlob: function (aType) {
                return null;
            }
        };
    };

    convertToColumns (classInfo) {
        const allColumns: any[]  = [];
        classInfo.forEachAttr(attrInfo => {
            if (attrInfo.isPrimitive()) {
                let newCol = attrInfo.getType().handlePrimitiveKey(this.primitiveTypeToColumnHandler(attrInfo));
                if (newCol) {
                    allColumns.push(newCol);
                }
            }
        });
        return allColumns;
    };

};
</script>
