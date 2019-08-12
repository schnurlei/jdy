<template>
    <v-container grid-list-md text-xs-left>
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
<!--            <v-flex xs6>
                <v-menu ref="menu" v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                        :return-value.sync="timeValue" transition="scale-transition" offset-y full-width
                        max-width="290px" min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="timeValue" label="Picker in menu" prepend-icon="access_time" readonly  v-on="on"></v-text-field>
                    </template>
                    <v-time-picker v-if="menu2" v-model="timeValue" full-width @click:minute="$refs.menu.save(timeValue)" format="24hr"></v-time-picker>
                </v-menu>
            </v-flex>-->
        </v-layout>
    </v-container>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyTimestampField',
        components: {
        }
    })
    export default class JdyTimestampField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        // property to get/set the value from the itemToEdit, when null use this.primAttr.getInternalName()
        @Prop({default: null}) valueProperty: string | null | undefined;

        menu2 = false;
        modal = false;

        get timeValue() {
            if (this.valueProperty) {
                return (this.itemToEdit) ? this.itemToEdit[this.valueProperty] : "";
            } else {
                return (this.itemToEdit  && this.primAttr) ? this.itemToEdit[this.primAttr.getInternalName()] : "";
            }
        }

        set timeValue (val) {
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = val;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = new Date(val);
            }
        }

        get dateValue () {

            let timestamp: Date | null = null;
            if (this.valueProperty) {
                timestamp =  (this.itemToEdit) ? this.itemToEdit[this.valueProperty] : "";
            } else {
                timestamp =  (this.itemToEdit  && this.primAttr) ? this.itemToEdit[this.primAttr.getInternalName()] : null;
            }

            return (timestamp) ? timestamp.toISOString().substr(0, 10) : "";
        };

        set dateValue (val) {
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = val;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = new Date(val);
            }
        }
    };

</script>
