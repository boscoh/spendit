<script>
    import '../app.scss';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import Header from './Header.svelte';
</script>

<div class="app">
    <Header/>
    <slot/>
</div>

<svelte:head>
<!-- Loading here as importing directly causes some typing issues -->
<script src="/bootstrap.bundle.min.js"></script>
</svelte:head>
