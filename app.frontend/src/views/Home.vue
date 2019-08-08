<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png"/>
        <div>About: {{aboutMessage}}</div>
        <div>Mode: {{readMode}}</div>
    </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
    },
    })
export default class Home extends Vue {

    aboutMessage: string = '-not initialized';
    // @ts-ignore
    readMode: string = (process.env.VUE_APP_READ_LOCAL) ? "Read Local" : "Read from Server";

    mounted () {
        this.fetchAbout();
    }

    fetchAbout () {
        fetch(new Request('api/about'))
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    // @ts-ignore
                    if (response.error) {
                        // @ts-ignore
                        throw new Error('Error reading data from server: ' + response.error);
                    } else {
                        throw new Error('Error reading data from server:');
                    }
                }
            })
            .then(data => { this.aboutMessage = 'done'/*data*/; return null; })
            .catch(error => {
                console.log(error);
                this.aboutMessage = '-Error reading data from server-';
            });
    }

}
</script>
