<template>
    <div>
        <div v-if="hasDomainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated()"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :selectedItem="selectedItem" :primAttr="primAttr"
                        :fieldLabel='primAttr.getInternalName()' :fieldReadonly="primAttr.isGenerated()" :isNotNull="primAttr.getNotNull()"
                         :minValue="primAttr.getType().getMinValue()" :maxValue="primAttr.getType().getMaxValue()" :scale="primAttr.getType().getScale()"></jdy-numeric>
        </div>
    </div>
</template>

<script lang='ts'>

    import Vue from 'vue';

    export default Vue.extend({

        props: ['selectedItem', 'primAttr'],
        data() {
            return {
                formFields: []
            };
        },
        computed: {

           hasDomainValues () : boolean {
                return this.primAttr.getType().domainValues && this.primAttr.getType().domainValues.length > 0;
            }
        }
});
</script>
