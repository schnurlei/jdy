<template>
    <div>
        {{numericValue}}
    <v-text-field v-model="fieldValue" :error-messages="errors.collect('numericValue')" data-vv-name="numericValue" :label="fieldLabelComputed"
                  v-validate="validationString" clearable :readonly="fieldReadonly" v-bind:value="numericValue" v-on:keydown="updateNumericValue($event)"/>

    </div>
</template>

<script>

function isKeyNumeric (key) {
    return key === '.' || key === ',' || key === '+' || key === '-' || /^\d+$/.test(key);
};

function isKeyCursor (key) {
    return key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End' |
           key === 'Delete' || key === 'Insert' || key === 'Tab';
};
export default {

    name: 'JdyNumericTextField',
    props: ['selectedItem', 'primAttr', 'fieldLabel', 'fieldReadonly', 'minValue', 'maxValue', 'scale', 'isNotNull'],
    data () {
        return {
            numericValue: ''
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
        },
        fieldLabelComputed () {
            let required = (this.isNotNull) ? '*' : '';
            return this.fieldLabel + required;
        },
        validationString () {
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
        }
    },
    methods: {
        updateNumericValue: function ($event) {
            if (!$event.altKey && !$event.ctrlKey && !isKeyNumeric($event.key) && !isKeyCursor($event.key)) {
                $event.preventDefault();
            }
        }
    }
};
</script>
