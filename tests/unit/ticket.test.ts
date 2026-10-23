import { describe, expect, it } from 'vitest';
import { validarEstado, validarTitulo } from '../../src/domain/ticket.js';

describe('validaciones del dominio', () => {
  it('elimina espacios laterales de un titulo correcto', () => {
    // Arrange: preparar el dato de entrada.
    const entrada = '  Falla en el acceso  ';
    // Act: ejecutar UN comportamiento.
    const resultado = validarTitulo(entrada);
    // Assert: comparar el resultado contra lo esperado.
    expect(resultado).toBe('Falla en el acceso');
  });

  it.each(['', 'ab', ' '.repeat(7), 42, null])(
    'rechaza titulo incorrecto %s', (entrada) => {
      expect(() => validarTitulo(entrada)).toThrow();
    },
  );

  it('solo acepta los estados definidos', () => {
    expect(validarEstado('resuelto')).toBe('resuelto');
    expect(() => validarEstado('cancelado')).toThrow('Estado no valido');
  });
});
