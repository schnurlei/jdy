<template>
    <div>
        {{numericValue}}
    <v-text-field v-model="fieldValue" :error-messages="errors.collect('numericValue')" data-vv-name="numericValue" :label="fieldLabelComputed"
                  v-validate="validationString" clearable :readonly="fieldReadonly" :disabled="fieldReadonly" v-bind:value="numericValue" v-on:keydown="updateNumericValue($event)"/>

    </div>
</template>

<script  lang='ts'>

    function isKeyNumeric (key) {
        return key === '.' || key === ',' || key === '+' || key === '-' || /^\d+$/.test(key);
    };

    function isKeyCursor (key) {
        return key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End' ||
            key === 'Delete' || key === 'Insert' || key === 'Tab';
    };

    import {Prop, Vue} from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import {JdyLongType, JdyPrimitiveAttributeInfo} from "@/js/jdy/jdy-base";

    @Component( {
        name: 'JdyNumericTextField',
        components: {
        }
    })
    export default class JdyNumericTextField extends Vue {

        @Prop({default: null}) primAttr: JdyPrimitiveAttributeInfo | null | undefined;
        @Prop() itemToEdit;
        @Prop() fieldLabel;
        @Prop() fieldReadonly;
        @Prop() minValue;
        @Prop() maxValue;
        @Prop() scale;
        @Prop({default: false}) isNotNull;
        // property to get/set the value from the itemToEdit, when null use this.primAttr.getInternalName()
        @Prop({default: null}) valueProperty: string | null | undefined;
        numericValue = '';

        get fieldValue() {
            if (this.valueProperty) {
                return (this.itemToEdit) ? this.itemToEdit[this.valueProperty] : "";
            } else {
                return (this.itemToEdit  && this.primAttr) ? this.itemToEdit[this.primAttr.getInternalName()] : "";
            }
        }

        set fieldValue (val) {
            const numVal = Number(val);
            if (this.valueProperty) {
                this.itemToEdit[this.valueProperty] = numVal;
            } else if (this.itemToEdit  && this.primAttr) {
                this.itemToEdit[this.primAttr.getInternalName()] = numVal;
            }
        }

        get fieldLabelComputed () {
            let required = (this.isNotNull) ? '*' : '';
            return this.fieldLabel + required;
        };

        get validationString () {
            let validation = 'decimal';
            if (this.scale) {
                validation += ':' +this.scale;
            }
            if (this.minValue || this.minValue === 0) {
                validation += '|min_value:' + this.minValue;
            }
            if (this.maxValue || this.minValue === 0) {
                validation += '|max_value:' + this.maxValue;
            }

            if (this.isNotNull) {
                validation += '|required';
            }

            return validation;
        };

        updateNumericValue ($event) {
            if (!$event.altKey && !$event.ctrlKey && !isKeyNumeric($event.key) && !isKeyCursor($event.key)) {
                $event.preventDefault();
            }
        }

    // https://gist.github.com/Christilut/1143d453ea070f7e8fa345f7ada1b999
    // https://github.com/paulpv/vuetify-number-field

};
</script>
