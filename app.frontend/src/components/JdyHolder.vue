<template>
    <div>
        <v-snackbar v-model="showMessage" color='error' :top='true' :multi-line=true :timeout='6000' >
            {{ errorMessage }}
            <v-btn dark text @click="showMessage = false"> Close </v-btn>
        </v-snackbar>
        <jdy-table :items="holderItems" :columns="columns" :classinfo="classinfo"></jdy-table>
    </div>
</template>

<script  lang='ts'>

import {JsonHttpObjectReader} from "@/js/jdy/jdy-http";
import {Prop, Vue, Watch} from 'vue-property-decorator';
import Component from 'vue-class-component';

@Component( {
    name: 'JdyHolder',
    components: {
    }
})
export default class JdyHolder extends Vue {

    @Prop() classinfo;
    readonly undefinedColumns = [{
            text: '#Undefined',
            left: true,
            sortable: false,
            value: item => item['BotanicName']
        }
        ];
    readonly undefinedData = [];

    holderItems = this.undefinedData;
    showMessage = false;
    errorMessage = '';
    reader : JsonHttpObjectReader = new JsonHttpObjectReader('/', 'meta',  process.env.VUE_APP_READ_LOCAL);

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

    get columns() {
        return (this.classinfo) ? this.convertToColumns(this.classinfo) : this.undefinedColumns;
    }

    @Watch('classinfo') onClassinfoChanged(newClassInfo) {

        if (newClassInfo) {

            this.reader.loadDataForClassInfo(newClassInfo)
                .then(data => {
                    this.holderItems = data;
                    return null;
                })
                .catch(error => {

                    this.holderItems = this.undefinedData;
                    this.errorMessage = error.message;
                    this.showMessage = true;
                });
        } else {

            this.holderItems = this.undefinedData;
        }
    }

};
</script>
