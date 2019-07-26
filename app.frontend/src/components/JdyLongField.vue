<template>
    <div>
        <div v-if="primAttr.getType().domainValues.length > 0">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :fieldLabel='primAttr.getInternalName()' :fieldReadonly="primAttr.isGenerated" :isNotNull="primAttr.getNotNull()"
                         :minValue="primAttr.getType().getMinValue()" :maxValue="primAttr.getType().getMaxValue()" :scale="0"></jdy-numeric>
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
