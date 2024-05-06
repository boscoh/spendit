<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <span class="navbar-brand">Spendit[vue3]</span>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" style="cursor: pointer">
            <RouterLink to="/" class="nav-link">Tables</RouterLink>
          </li>
          <li class="nav-item" style="cursor: pointer">
            <RouterLink to="/about" class="nav-link">About</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
