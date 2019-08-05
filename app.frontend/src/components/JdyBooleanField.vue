<template>
    <div>
        {{selectedItem}}
        <v-switch :label='primAttr.getInternalName ()' :readonly="primAttr.isGenerated()"  v-model="fieldValue"></v-switch>
    </div>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            formFields: []
        };
    },
    computed: {
        fieldValue: {
            get: function () {
                return (this.selectedItem) ? this.selectedItem[this.primAttr.getInternalName()] : "";
            },
            set: function (val) {
                if (this.selectedItem) {
                    this.selectedItem[this.primAttr.getInternalName()] = val;
                }
            }
        }
    }

};
</script>
