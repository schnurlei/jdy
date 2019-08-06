<template>
    <v-container grid-list-md text-xs-left>
        {{selectedItem}}
        <v-layout row wrap>
            <v-flex xs6>
                <v-dialog ref="dialog" v-model="modal" :return-value.sync="dateValue" persistent  full-width width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="dateValue" :label='primAttr.getInternalName ()'  prepend-icon="event" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="dateValue" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modal = false">Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.dialog.save(dateValue)">OK</v-btn>
                    </v-date-picker>
                </v-dialog>
            </v-flex>
            <v-flex xs6>
                <v-menu ref="menu" v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                        :return-value.sync="timeValue" transition="scale-transition" offset-y full-width
                        max-width="290px" min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="timeValue" label="Picker in menu" prepend-icon="access_time" readonly  v-on="on"></v-text-field>
                    </template>
                    <v-time-picker v-if="menu2" v-model="timeValue" full-width @click:minute="$refs.menu.save(timeValue)" format="24hr"></v-time-picker>
                </v-menu>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            formFields: [],
            menu2: false,
            modal: false
        };
    },
    computed: {
        timeValue: {
            get: function () {
                return (this.selectedItem) ? this.selectedItem[this.primAttr.getInternalName()] : "";
            },
            set: function (val) {
                console.log("time: " + val);
                if (this.selectedItem) {
                    this.selectedItem[this.primAttr.getInternalName()] = val;
                }
            }
        },
        dateValue: {
            get: function () {
                return (this.selectedItem) ? this.selectedItem[this.primAttr.getInternalName()] : "";
            },
            set: function (val) {
                console.log("date: " + val);
                if (this.selectedItem) {
                    this.selectedItem[this.primAttr.getInternalName()] = val;
                }
            }
        }
    }
};
</script>
