<template>
    <div>
        <v-dialog ref="dialog" v-model="modal" :return-value.sync="date" persistent  lazy full-width width="290px">
            <v-text-field slot="activator"  v-model="date" :label='primAttr.getInternalName ()'  prepend-icon="event" readonly></v-text-field>
            <v-date-picker v-model="date" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog.save(date)">OK</v-btn>
            </v-date-picker>
        </v-dialog>
        <v-menu
                ref="menu2"
                :close-on-content-click="false"
                v-model="menu2"
                :nudge-right="40"
                :return-value.sync="time"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="290px"
                min-width="290px"
        >
            <v-text-field slot="activator" v-model="time" label="Picker in menu" prepend-icon="access_time" readonly></v-text-field>
            <v-time-picker v-if="menu2" v-model="time" @change="$refs.menu2.save(time)" format="24hr"></v-time-picker>
        </v-menu>

    </div>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            formFields: [],
            date: null,
            time: null,
            menu2: false,
            modal2: false
        };
    }
};
</script>
