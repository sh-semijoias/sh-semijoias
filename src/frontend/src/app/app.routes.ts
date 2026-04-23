import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './pages/usuarios/lista-usuarios/lista-usuarios';
import { FormUsuarioComponent } from './pages/usuarios/form-usuario/form-usuario';

export const routes: Routes = [
  { path: '', component: ListaUsuariosComponent },
  { path: 'usuarios/novo', component: FormUsuarioComponent },
  { path: 'usuarios/:id/editar', component: FormUsuarioComponent },
];
