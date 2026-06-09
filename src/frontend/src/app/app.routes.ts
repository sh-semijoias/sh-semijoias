import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './pages/usuarios/lista-usuarios/lista-usuarios';
import { FormUsuarioComponent } from './pages/usuarios/form-usuario/form-usuario';
import { LoginComponent } from './pages/auth/login/login';
import { ListaEstoqueComponent } from './pages/estoque/lista-estoque/lista-estoque';
import { NovaEntradaEstoqueComponent } from './pages/estoque/nova-entrada/nova-entrada';
import { authGuard } from './core/services/auth.guard';
import { Perfil } from './core/enums/perfil.enum';
import { ListaClientesComponent } from './pages/clientes/lista-clientes/lista-clientes';
import { FormClienteComponent } from './pages/clientes/form-clientes/form-clientes';
import { ListaMaletasComponent } from './pages/estoque/maletas/lista-maletas/lista-maletas';
import { FormMaletaComponent } from './pages/estoque/maletas/form-maleta/form-maleta';
import { FormProdutoComponent } from './pages/produtos/form-produto/form-produto';
import { ListaVendasComponent } from './pages/vendas/lista-vendas/lista-vendas';
import { FormVendaComponent } from './pages/vendas/form-venda/form-venda';

export const routes: Routes = [
  { path: '', redirectTo: 'vendas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'usuarios', component: ListaUsuariosComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'usuarios/novo', component: FormUsuarioComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'usuarios/:id/editar', component: FormUsuarioComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'estoque/entrada', component: NovaEntradaEstoqueComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'estoque', component: ListaEstoqueComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'maletas', component: ListaMaletasComponent, canActivate: [authGuard()] },
  { path: 'maletas/nova', component: FormMaletaComponent, canActivate: [authGuard(Perfil.Administrador)] },
  {  path: 'maletas/:id',  component: FormMaletaComponent,  canActivate: [authGuard()]},
  { path: 'maletas/:id/editar', component: FormMaletaComponent, canActivate: [authGuard(Perfil.Administrador)] },
  { path: 'clientes', component: ListaClientesComponent, canActivate: [authGuard] },
  { path: 'clientes/novo', component: FormClienteComponent, canActivate: [authGuard] },
  { path: 'clientes/:id/editar', component: FormClienteComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ListaEstoqueComponent, canActivate: [authGuard()] },
  { path: 'produtos/novo', component: FormProdutoComponent, canActivate: [authGuard()] },
  { path: 'produtos/:id', component: FormProdutoComponent, canActivate: [authGuard()] },
  { path: 'vendas', component: ListaVendasComponent, canActivate: [authGuard()] },
  { path: 'vendas/nova', component: FormVendaComponent, canActivate: [authGuard()] },
  {  path: 'vendas/:id',  component: FormVendaComponent,  canActivate: [authGuard()]},
];
