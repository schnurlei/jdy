<template>
    <div>
        <div v-if="hasDomainValues">
            <v-combobox :label='primAttr.getInternalName ()' clearable :items="primAttr.getType().domainValues" :readonly="primAttr.isGenerated()"></v-combobox>
        </div>
        <div v-else>
            <jdy-numeric :itemToEdit="itemToEdit" :primAttr="primAttr" :valueProperty="valueProperty"
                        :fieldLabel='primAttr.getInternalName()' :fieldReadonly="primAttr.isGenerated()" :isNotNull="primAttr.getNotNull()"
                         :minValue="primAttr.getType().getMinValue()" :maxValue="primAttr.getType().getMaxValue()" :scale="0"></jdy-numeric>
        </div>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyLongType, JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyLongField',
        components: {
        }
    })
    export default class JdyLongField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        @Prop({default: null}) valueProperty: string | null | undefined;

        get hasDomainValues ()  {

            let textType = (this.primAttr) ? this.primAttr.getType() as JdyLongType : null;
            let domainValues = (textType) ? textType.getDomainValues() : null;
            return !!(domainValues && domainValues.length);
        };
    };
</script>
