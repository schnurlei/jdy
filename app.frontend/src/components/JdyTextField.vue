<template>
    <div>
        <v-textarea :label='primAttr.getInternalName ()' clearable :counter="primAttr.getType().length" :readonly="primAttr.isGenerated"></v-textarea>
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
