import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class BrDateAdapter extends NativeDateAdapter {

  override parse(value: any): Date | null {

    if (typeof value === 'string' && value.includes('/')) {

      const [day, month, year] = value.split('/');

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    return value ? new Date(value) : null;
  }

  override format(date: Date): string {

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
