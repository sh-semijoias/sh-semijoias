import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';


@Injectable()
export class BrDateAdapter extends NativeDateAdapter {

override parse(value: any): Date | null {
  console.log('PARSE RECEBEU:', value);

    if (typeof value === 'string') {

      const partes = value.split('/');

      if (partes.length !== 3) {
        return null;
      }

      const [day, month, year] = partes.map(Number);

      if (
        !day ||
        !month ||
        !year ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1000
      ) {
        return null;
      }

      const date = new Date(year, month - 1, day);

      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    }

    return value instanceof Date ? value : null;
  }

  override format(date: Date): string {

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  override deserialize(value: any): Date | null {

  if (typeof value === 'string' && value.includes('/')) {
    return this.parse(value);
  }

  if (value instanceof Date) {
    return value;
  }

  return super.deserialize(value);
}

}
