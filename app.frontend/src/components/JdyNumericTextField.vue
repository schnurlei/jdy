<template>
    <div>
    <input label="Numeric Input" v-bind:value="numericValue" v-on:keydown="updateNumericValue($event)"/>

    </div>
</template>

<script>

function isKeyNumeric (key) {
    return key === '.' || key === ',' || key === '+' || key === '-' || /^\d+$/.test(key);
};

function isKeyCursor (key) {
    return key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End'
        || key === 'Delete' || key === 'Insert' || key === 'Tab';
};
export default {

    name: 'JdyNumericTextField',
    data () {
        return {
            numericValue: ''
        };
    },
    methods: {
        updateNumericValue: function ($event) {
            if (!$event.altKey && !$event.ctrlKey && !isKeyNumeric($event.key) && !isKeyCursor ($event.key) ) {
                console.log($event);
                $event.preventDefault();
            }
        }
    }
};
</script>
