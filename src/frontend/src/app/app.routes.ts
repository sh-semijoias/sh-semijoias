import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './pages/usuarios/lista-usuarios/lista-usuarios';
import { FormUsuarioComponent } from './pages/usuarios/form-usuario/form-usuario';
import { LoginComponent } from './pages/auth/login/login';
import { authGuard } from './core/services/auth.guard';
import { ListaClientesComponent } from './pages/clientes/lista-clientes/lista-clientes';
import { FormClienteComponent } from './pages/clientes/form-clientes/form-clientes';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'usuarios', component: ListaUsuariosComponent, canActivate: [authGuard] },
  { path: 'usuarios/novo', component: FormUsuarioComponent, canActivate: [authGuard] },
  { path: 'usuarios/:id/editar', component: FormUsuarioComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ListaClientesComponent, canActivate: [authGuard] },
  { path: 'clientes/novo', component: FormClienteComponent, canActivate: [authGuard] },
  { path: 'clientes/:id/editar', component: FormClienteComponent, canActivate: [authGuard] },

];
