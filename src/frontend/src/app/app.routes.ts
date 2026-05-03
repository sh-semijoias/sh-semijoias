import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './pages/usuarios/lista-usuarios/lista-usuarios';
import { FormUsuarioComponent } from './pages/usuarios/form-usuario/form-usuario';
import { LoginComponent } from './pages/auth/login/login';
import { authGuard } from './core/services/auth.guard';
import { ListaProdutosComponent } from './pages/produtos/lista-produtos/lista-produtos';
import { FormProdutoComponent } from './pages/produtos/form-produto/form-produto';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'usuarios', component: ListaUsuariosComponent, canActivate: [authGuard] },
  { path: 'usuarios/novo', component: FormUsuarioComponent, canActivate: [authGuard] },
  { path: 'usuarios/:id/editar', component: FormUsuarioComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ListaProdutosComponent, canActivate: [authGuard] },
  { path: 'produtos/novo', component: FormProdutoComponent, canActivate: [authGuard] },
  { path: 'produtos/:id/editar', component: FormProdutoComponent, canActivate: [authGuard] },
];
