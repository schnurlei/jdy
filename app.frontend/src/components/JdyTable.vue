<template>

    <div>
        <v-snackbar v-model="showMessage" color='error' :top='true' :multi-line=true :timeout='6000' >
            {{ errorMessage }}
            <v-btn dark text @click="showMessage = false">Close</v-btn>
        </v-snackbar>
        <v-data-table :headers="headers"  :items="items"   class="elevation-1">
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <v-toolbar-title>{{typeName}}</v-toolbar-title>
                    <v-divider class="mx-2" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark class="mb-2" @click="editInDialog(null)">New Item</v-btn>
                    <v-dialog v-model="isEditDialogVisible" max-width="500px">
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <jdy-panel :editedItem="editedItem" :classinfo="classinfo"></jdy-panel>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon small @click="editInDialog(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small @click="deleteItem(item)">
                    mdi-delete
                </v-icon>
            </template>
            <template v-slot:no-data>
                No Data found
            </template>
            <template  v-for="attr in booleanAttrs" v-slot:[attr.item]="{ item }">
                <v-checkbox v-model="item[attr.attr]" class="mx-2" disabled></v-checkbox>
            </template>
            <template  v-for="dateItem in dateAttrs" v-slot:[dateItem.item]="{ item }">
                {{new Date(item[dateItem.attr]).toLocaleDateString()}}
            </template>
        </v-data-table>
    </div>
</template>

<script  lang='ts'>

import {Prop, Vue} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {
    JdyClassInfo,
    JdyPrimitiveAttributeInfo,
    JdyTypedValueObject
} from "@/js/jdy/jdy-base";
import {JsonHttpObjectWriter} from "@/js/jdy/jdy-http";

var editHeader = [
    {
        text: 'Edit',
        align: 'left',
        sortable: false,
        value: 'action'
    }
];

@Component( {
    name: 'JdyTable',
    components: {
    }
})
export default class JdyTable extends Vue {

    @Prop({default: null}) items: any | null | undefined;
    @Prop({default: null}) columns: any | null | undefined;
    @Prop({default: null}) classinfo: JdyClassInfo | null | undefined;
    editedIndex: null|  number = null;

    isEditDialogVisible = false;
    editedItem = {};
    writer = new JsonHttpObjectWriter("");
    showMessage = false;
    errorMessage = '';

        // a computed getter
    get headers () {
            return editHeader.concat(this.columns);
     }

     get formTitle () {
            return this.editedIndex === -1 ? 'New ' + this.typeName : 'Edit ' + this.typeName;
      }

      get booleanAttrs() {
            let allBooleanAttrs: any[] = [];
            if (this.classinfo) {
                this.classinfo.forEachAttr(attrInfo => {
                    if (attrInfo.isPrimitive()) {
                        const primType = attrInfo as JdyPrimitiveAttributeInfo;
                        if (primType.getType().getType() === 'BOOLEAN') {
                            allBooleanAttrs.push({item: 'item.' + attrInfo.getInternalName(), attr: attrInfo.getInternalName()});
                        }
                    }
                });
            }
            return allBooleanAttrs;
    }

    get dateAttrs() {

        let allDateAttrs: any[] = [];
        if (this.classinfo) {
            this.classinfo.forEachAttr(attrInfo => {
                if (attrInfo.isPrimitive()) {
                    const primType = attrInfo as JdyPrimitiveAttributeInfo;
                    if (primType.getType().getType() === 'TIMESTAMP') {
                        allDateAttrs.push({item: 'item.' + attrInfo.getInternalName(), attr: attrInfo.getInternalName()});
                    }
                }
            });
        }
        return allDateAttrs;
    }

    get typeName() {
        return (this.classinfo) ? this.classinfo.getInternalName(): "";
    }

    editInDialog (listItem) {

        if(listItem) {
            this.editedIndex = this.items.indexOf(listItem);
            this.editedItem = listItem.copy();
        } else {
            this.editedIndex = -1;
            if (this.classinfo) {
                this.editedItem = new JdyTypedValueObject(this.classinfo, null, false);
            }
        }
        this.isEditDialogVisible = true;
    }

    deleteItem (listItem) {
        if (confirm('Are you sure you want to delete this item?') ) {
            this.items.splice(this.items.findIndex(x => x.name === listItem.name), 1);
        }
    }

    close () {
        this.isEditDialogVisible = false;
        setTimeout(() => {
            this.editedItem = {};
            this.editedIndex = -1;
        }, 300);
    }

    save () {
        if (this.editedIndex && this.editedIndex > -1) {
            const listItem = this.items[this.editedIndex];
            this.writer.insertObjectInDb(this.editedItem
                , (result => {
                    Object.assign(listItem, result)
                })
                , (error => {
                    this.errorMessage = error.message;
                    this.showMessage = true;
                }));

        } else {
            this.writer.insertObjectInDb(this.editedItem
                , (result => {
                    this.items.push(result);
                })
                , (error =>  {
                    this.errorMessage = error.message;
                    this.showMessage = true;
                }));
        }
        this.close();
    }

};
</script>
