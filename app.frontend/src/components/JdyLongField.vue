<template>
    <div>
        <div v-if="primAttr.getType().domainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :fieldLabel='primAttr.getInternalName()' :fieldReadonly="primAttr.isGenerated" :minValue="primAttr.getType().getMinValue()" :maxValue="primAttr.getType().getMaxValue()"></jdy-numeric>
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
