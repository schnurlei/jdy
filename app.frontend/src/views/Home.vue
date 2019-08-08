<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png"/>
        <div>About: {{aboutMessage}}</div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { JsonHttpObjectReader } from '@/js/jdy/jdy-http';

@Component({
    components: {
    },
    })
export default class Home extends Vue {

    aboutMessage: string = '-not initialized';

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
