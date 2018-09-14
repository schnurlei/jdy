<template>
    <div>
        <v-dialog ref="dialog" v-model="modal" :return-value.sync="date" persistent  lazy full-width width="290px">
            <v-text-field slot="activator" :label='primAttr.getInternalName ()'  prepend-icon="event" readonly></v-text-field>
            <v-date-picker v-model="date" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
            </v-date-picker>
        </v-dialog>

    </div>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            formFields: []
        };
    }
};
</script>
