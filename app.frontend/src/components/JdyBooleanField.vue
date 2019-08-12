<template>
    <div>
        <v-switch :label='primAttr.getInternalName ()' :readonly="primAttr.isGenerated()"  v-model="fieldValue"></v-switch>
    </div>
</template>

<script  lang='ts'>

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyDecimalType, JdyLongType, JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyBooleanField',
        components: {
        }
    })
    export default class JdyBooleanField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        // property to get/set the value from the itemToEdit, when null use this.primAttr.getInternalName()
        @Prop({default: null}) valueProperty: string | null | undefined;

        get fieldValue() {
            if (this.valueProperty) {
                return (this.itemToEdit) ? this.itemToEdit[this.valueProperty] : "";
            } else {
                return (this.itemToEdit  && this.primAttr) ? this.itemToEdit[this.primAttr.getInternalName()] : "";
            }
        }

        set fieldValue (val) {
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = val;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = val;
            }
        }
    }
</script>
