<template>

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
            <v-checkbox v-model="item[attr.attr]" class="mx-2"></v-checkbox>
        </template>
        <template  v-for="dateItem in dateAttrs" v-slot:[dateItem.item]="{ item }">
            {{new Date(item[dateItem.attr]).toLocaleDateString()}}
        </template>
    </v-data-table>
</template>

<script>
import {JdyTypedValueObject} from "@/js/jdy/jdy-base";

var editHeader = [
    {
        text: 'Edit',
        align: 'left',
        sortable: false,
        value: 'action'
    }
];

export default {
    props: ['items', 'columns', 'classinfo'],
    data () {
        return {
            isEditDialogVisible: false,
            editedItem: {}
        };
    },
    computed: {
        // a computed getter
        headers () {
            return editHeader.concat(this.columns);
        },
        formTitle () {
            return this.editedIndex === -1 ? 'New ' + this.typeName : 'Edit ' + this.typeName;
        },
        booleanAttrs() {
            return [{ item: 'item.wintergreen', attr: 'wintergreen'}];
        },
        dateAttrs() {

            let allDateAttrs = [];
            if (this.classinfo) {
                this.classinfo.forEachAttr(attrInfo => {
                    if (attrInfo.isPrimitive()) {

                        if (attrInfo.getType().getType() === 'TIMESTAMP') {
                            allDateAttrs.push({item: 'item.' + attrInfo.getInternalName(), attr: attrInfo.getInternalName()});
                        }
                    }
                });
            }
            return allDateAttrs;
        },
        typeName() {
            return (this.classinfo) ? this.classinfo.getInternalName(): "";
        }


    },
    methods: {
        editInDialog: function (listItem, event) {

            if(listItem) {
                this.editedIndex = this.items.indexOf(listItem)
                this.editedItem = listItem.copy();
            } else {
                this.editedIndex = -1;
                this.editedItem = new JdyTypedValueObject(this.classinfo, null, false);
            }
            this.isEditDialogVisible = true;
        },
        deleteItem: function (listItem, event) {
            if (confirm('Are you sure you want to delete this item?') ) {
                this.items.splice(this.items.findIndex(x => x.name === listItem.name), 1);
            }
        },
        close () {
            this.isEditDialogVisible = false;
            setTimeout(() => {
                this.editedItem = {};
                this.editedIndex = -1;
            }, 300);
        },
        save () {
            if (this.editedIndex > -1) {
                 Object.assign(this.items[this.editedIndex], this.editedItem);
            } else {
                    this.items.push(this.editedItem);
            }
            this.close();
        }
    }
};
</script>
