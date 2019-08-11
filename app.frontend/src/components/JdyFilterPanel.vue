<template>

    <v-data-table :headers="headers" :items="filterExpressions" hide-default-footer class="elevation-1">
        <template v-slot:top>
            <v-banner max-width="300" single-line transition="slide-y-transition">
                Filter
                <template v-slot:actions="{ dismiss }">
                    <v-btn text color="primary" @click="editExpressionInDialog(null)"><v-icon>mdi-plus</v-icon></v-btn>
                </template>
            </v-banner>
            <v-dialog v-model="isEditDialogVisible" max-width="800px">
                <v-card>
                    <v-card-title>
                        <span class="headline">Add Expression</span>
                    </v-card-title>
                    <v-card-text>
                        <jdy-expr-form :classInfo="classinfo" :expression="editedExpression"> </jdy-expr-form>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                        <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

        </template>
        <template v-slot:item.action="{ item }">
            <v-icon small @click="editInDialog(item)">
                mdi-pencil
            </v-icon>
            <v-icon small @click="deleteItem(item)">
                mdi-delete
            </v-icon>
        </template>
    </v-data-table>
</template>

<script  lang='ts'>

    import {Prop, Vue, Watch} from 'vue-property-decorator';
    import Component from 'vue-class-component';

    @Component( {
        name: 'JdyFilterPanel',
        components: {
        }
    })
    export default class JdyFilterPanel extends Vue {

        @Prop() classinfo;
        filterExpressions: any[] = [];
        editedExpression = {};
        editedIndex;
        headers = [
            { text: 'Attribute', align: 'left', sortable: false, value: 'attribute' },
            { text: 'Operator', align: 'left', sortable: false, value: 'operator' },
            { text: 'Value', value: 'value' },
            { text: 'Aktion', value: 'action' }];
        isEditDialogVisible = false;

        editExpressionInDialog (expressionToEdit) {

            if(expressionToEdit) {
                this.editedIndex = this.filterExpressions.indexOf(expressionToEdit)
                this.editedExpression = expressionToEdit;
            } else {
                this.editedIndex = -1;
                this.editedExpression = {};
            }
            this.isEditDialogVisible = true;
        }

        close () {
            this.isEditDialogVisible = false;
            setTimeout(() => {
                this.editedExpression = {};
            }, 300);
        }

        save () {
            if (this.editedIndex > -1) {
                Object.assign(this.filterExpressions[this.editedIndex], this.editedExpression);
            } else {
                this.filterExpressions.push(this.editedExpression);
            }
            this.close();
        }
    };

</script>
