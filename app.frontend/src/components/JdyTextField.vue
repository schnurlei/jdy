<template>
    <div>
        <v-textarea :label='primAttr.getInternalName ()' v-model="fieldValue" clearable :counter="primAttr.getType().length" :readonly="primAttr.isGenerated()"></v-textarea>
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
