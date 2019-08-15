<template>
    <div>
        <v-snackbar v-model="showMessage" color='error' :top='true' :multi-line=true :timeout='6000' >
            {{ errorMessage }}
            <v-btn dark text @click="showMessage = false"> Close </v-btn>
        </v-snackbar>
        <jdy-filter :classinfo="classinfo" :filterExpressions="filterExpressions">
            <template v-slot:refresh-btn>
                <v-btn text color="primary" @click="reloadFilteredData()"><v-icon>mdi-refresh</v-icon></v-btn>
            </template>
        </jdy-filter>
        <jdy-table :items="holderItems" :columns="columns" :classinfo="classinfo"></jdy-table>
    </div>
</template>

<script  lang='ts'>

import {JsonHttpObjectReader} from "@/js/jdy/jdy-http";
import {Prop, Vue, Watch} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {
    JdyAndExpression,
    JdyClassInfoQuery,
    JdyOperatorExpression,
    JdyQueryCreator,
    ObjectFilterExpression
} from "@/js/jdy/jdy-base";
import {OperatorExprHolder} from "@/js/jdy/jdy-view";

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
    filterExpressions: OperatorExprHolder[] = [];
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

    convertToColumns (aClassInfo) {
        const allColumns: any[]  = [];
        aClassInfo.forEachAttr(attrInfo => {
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

    reloadFilteredData() {
        console.log("refresh data");
        if (this.classinfo) {

            let operatorExpr:  ObjectFilterExpression[] = [];
            this.filterExpressions
                .forEach(exprHolder => {
                    if (exprHolder.operator && exprHolder.attribute) {
                        operatorExpr.push(new JdyOperatorExpression(exprHolder.operator, exprHolder.attribute,  exprHolder.value));
                    }
                });

            let andExpr = new JdyAndExpression(operatorExpr);
            let query = new JdyClassInfoQuery(this.classinfo, andExpr);

            this.reader.loadValuesFromDb(query)
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

    mounted () {

        this.loadAllDataForClasssInfo(this.classinfo);
    }

    @Watch('classinfo') onClassinfoChanged(newClassInfo) {

        this.loadAllDataForClasssInfo(newClassInfo)
    }

    loadAllDataForClasssInfo(aClassInfo) {

        if (aClassInfo) {

            this.reader.loadDataForClassInfo(aClassInfo)
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
