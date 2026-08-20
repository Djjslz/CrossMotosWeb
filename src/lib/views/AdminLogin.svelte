<script>
  import { api, guardarSesion, getUsuario, getToken } from "../../lib/api.js";

  let { onLogin = () => {} } = $props();

  let usuario = $state("");
  let password = $state("");
  let cargando = $state(false);
  let error = $state("");
  let showPass = $state(false);
  let sesionActiva = $state(Boolean(getToken()));

  let currentUser = $state(getUsuario());

  async function ingresar(e) {
    e.preventDefault();
    cargando = true;
    error = "";
    try {
      const data = await api.post("/auth/login", {
        usuario: usuario.trim(),
        password,
      });
      guardarSesion(data.token, data.usuario);
      sesionActiva = true;
      currentUser = data.usuario;
      usuario = "";
      password = "";
      onLogin();
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }
</script>

<section class="container section" style="max-width:460px;margin:0 auto">
  <div class="login-card">
    {#if sesionActiva && currentUser}
      <div class="login-session">
        <div class="avatar">
          {currentUser.nombre?.charAt(0).toUpperCase() || "A"}
        </div>
        <h2>Hola, {currentUser.nombre}</h2>
        <p class="login-email">{currentUser.email}</p>
        <p class="login-rol">Rol: {currentUser.rol}</p>
      </div>
    {:else}
      <div class="login-head">
        <span class="brand-mark">CM</span>
        <h2>Panel de administración</h2>
        <p>Ingresa con tu usuario para gestionar productos y precios.</p>
      </div>

      {#if error}
        <div class="error-box">{error}</div>
      {/if}

      <form onsubmit={ingresar} autocomplete="on">
        <label class="field">
          <span>Usuario</span>
          <input
            type="text"
            bind:value={usuario}
            placeholder="Usuario"
            autocomplete="on"
            required
          />
        </label>
        <label class="field">
          <span>Contraseña</span>
          <div class="pass-wrap">
            <input
              type={showPass ? "text" : "password"}
              bind:value={password}
              placeholder="Contraseña"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="pass-toggle"
              onclick={() => (showPass = !showPass)}
              aria-label={showPass
                ? "Ocultar contraseña"
                : "Mostrar contraseña"}
            >
              {showPass ? "Ocultar" : "Ver"}
            </button>
          </div>
        </label>
        <button
          class="btn btn-primary btn-block"
          type="submit"
          disabled={cargando}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    {/if}
  </div>
</section>
