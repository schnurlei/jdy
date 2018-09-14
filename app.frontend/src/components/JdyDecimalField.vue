<template>
    <div>
        <div v-if="primAttr.getType().domainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated"></v-combobox>
        </div>
        <div v-else>
            <v-text-field :label='primAttr.getInternalName ()' clearable :counter="primAttr.getType().length" :readonly="primAttr.isGenerated" number></v-text-field>
        </div>
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
