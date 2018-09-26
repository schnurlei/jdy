<template>
    <div>
        <div v-if="primAttr.getType().domainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated"></v-combobox>
        </div>
        <div v-else>
            <v-text-field  v-validate="validationString" :error-messages="errors.collect('fieldValue')" data-vv-name="fieldValue" v-model="fieldValue" :label='primAttr.getInternalName ()' clearable :counter="primAttr.getType().length" :readonly="primAttr.isGenerated"></v-text-field>
        </div>
    </div>
</template>

<script>
export default {

    props: ['selectedItem', 'primAttr'],
    data () {
        return {
            fieldValue: '',
            formFields: []
        };
    },
    computed: {
        validationString () {
            let validation = '';
            if (this.primAttr.getType().length > 0) {
                validation += 'max:'+this.primAttr.getType().length;
            }
            if (this.primAttr.getNotNull()) {
                if (validation.length > 0) {
                    validation += '|';
                }
                validation += 'required';
            }

            return validation;
        }
    }
};
</script>
