<template>
    <div>
    <v-text-field :label="fieldLabel" clearable :readonly="fieldReadonly" v-bind:value="numericValue" :hint="rangeHint()" v-on:keydown="updateNumericValue($event)"/>

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
    props: ['fieldLabel', 'fieldReadonly', 'minValue', 'maxValue'],
    data () {
        return {
            numericValue: ''
        };
    },
    methods: {
        updateNumericValue: function ($event) {
            if (!$event.altKey && !$event.ctrlKey && !isKeyNumeric($event.key) && !isKeyCursor($event.key)) {
                $event.preventDefault();
            }
        },
        rangeHint: function () {
            let hint = '';
            if (this.minValue || this.minValue === 0) {
                hint += 'Min Value: ' + this.minValue + '; ';
            }
            if (this.maxValue) {
                hint += 'Max Value: ' + this.maxValue;
            }
            return hint;
        }
    }
};
</script>
