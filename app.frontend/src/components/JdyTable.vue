<template>
    <div>
        <v-toolbar flat color="white">
            <v-toolbar-title>My CRUD</v-toolbar-title>
            <v-divider
                    class="mx-2"
                    inset
                    vertical
            ></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="isEditDialogVisible" max-width="500px">
                <v-btn slot="activator" color="primary" dark class="mb-2">New Item</v-btn>
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-card-text>
                        <jdy-panel :selectedItem="selectedItem" :classinfo="classinfo"></jdy-panel>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                        <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-toolbar>
        <v-data-table  :headers="headers"  :items="items"  hide-actions  class="elevation-1">
        <template slot="items" slot-scope="props">
            <td class="justify-center layout px-0">
                <v-icon small class="mr-2" @click="editInDialog(props.item)">edit</v-icon>
                <v-icon small @click="deleteItem(props.item)">delete</v-icon>
            </td>
        <td v-bind:class="[header.left ? '' : 'text-xs-right']" v-for="(header, index) in columns" :key="index">
        {{ header.value(props.item)}}
        </td>
        </template>
        </v-data-table>
    </div>

</template>

<script>
var editHeader = [
    {
        text: 'Edit',
        align: 'left',
        sortable: false,
        value: item => ''
    }
];

var selectedItem;

export default {
    props: ['items', 'columns', 'classinfo'],
    data () {
        return {
            isEditDialogVisible: false,
            selectedItem: null
        };
    },
    computed: {
        // a computed getter
        headers () {
            return editHeader.concat(this.columns);
        },
        formTitle () {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
        }

    },
    methods: {
        editInDialog: function (listItem, event) {
            // `this` inside methods points to the Vue instance
            this.isEditDialogVisible = true;
            this.selectedItem = listItem;
        },
        deleteItem: function (listItem, event) {
            // `this` inside methods points to the Vue instance
            this.items.splice(this.items.findIndex(x => x.name === listItem.name), 1);
        },
        close () {
            this.isEditDialogVisible = false;
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            }, 300);
        },
        save () {
            if (this.editedIndex > -1) {
                // Object.assign(this.desserts[this.editedIndex], this.editedItem);
            } else {
                // this.desserts.push(this.editedItem);
            }
            this.close();
        }
    }
};
</script>
