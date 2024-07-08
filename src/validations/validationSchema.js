// validationSchemas.js
const { z } = require('zod')

const userSchema = z.object({
  username: z.string().min(6, { message: 'El usuario no debe tener menos de 6 caracteres.' }),
  password: z.string().min(6, { message: 'El password no debe tener menos de 6 caracteres.' })
})

module.exports = {
  userSchema
}

// Tipos de Datos:

// z.string(): Valida que el valor sea una cadena de texto.
// z.number(): Valida que el valor sea un número.
// z.boolean(): Valida que el valor sea booleano (true o false).
// z.date(): Valida que el valor sea una fecha válida.
// Validaciones de Longitud:

// z.string().min(minLength): Valida que la cadena tenga al menos minLength caracteres.
// z.string().max(maxLength): Valida que la cadena tenga como máximo maxLength caracteres.
// z.string().length(length): Valida que la cadena tenga exactamente length caracteres.
// Validaciones Numéricas:

// z.number().min(minValue): Valida que el número sea mayor o igual que minValue.
// z.number().max(maxValue): Valida que el número sea menor o igual que maxValue.
// z.number().positive(): Valida que el número sea positivo.
// z.number().negative(): Valida que el número sea negativo.
// Validaciones de Formato:

// z.string().email(): Valida que el valor sea un formato de correo electrónico válido.
// z.string().url(): Valida que el valor sea un formato de URL válido.
// z.string().regex(pattern): Valida que la cadena coincida con el patrón regex especificado.
// Validaciones de Valores Permitidos:

// z.string().enum(values): Valida que el valor esté dentro de una lista específica de valores.
// z.literal(value): Valida que el valor sea igual a un valor literal específico.
// Combinaciones y Validaciones Avanzadas:

// z.object({}): Valida que el valor sea un objeto y define las validaciones para las propiedades del objeto.
// z.array(itemSchema): Valida que el valor sea un array y define las validaciones para los elementos del array.
// z.union([schema1, schema2, ...]): Valida que el valor cumpla con al menos una de las validaciones definidas en las schemas dentro del arreglo.
// z.optional(schema): Marca una schema como opcional, permitiendo que el valor pueda ser undefined.

// Validación de Código Postal (5 dígitos):

// ^\d{5}$
// ^ indica el inicio del string.
// \d representa cualquier dígito numérico (equivalente a [0-9]).
// {5} indica que debe haber exactamente 5 dígitos.
// $ indica el final del string.
// En resumen, verifica que la cadena contenga exactamente 5 dígitos numéricos consecutivos.
// Validación de Números de Teléfono (10 dígitos numéricos):

// ^\d{10}$
// ^ y $ tienen el mismo significado que en el caso anterior.
// \d{10} indica que debe haber exactamente 10 dígitos numéricos consecutivos.
// Verifica que la cadena contenga exactamente 10 dígitos numéricos.
// Validación de Dirección de Correo Electrónico:

// ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
// [\w-\.]+ verifica que la parte local del correo electrónico (antes del @) contenga uno o más caracteres alfanuméricos, guiones (-) o puntos (.).
// @ verifica la presencia del símbolo @.
// ([\w-]+\.)+ verifica que el dominio del correo electrónico (después del @) contenga uno o más segmentos alfanuméricos seguidos de un punto (.).
// [\w-]{2,4} verifica que el dominio tenga entre 2 y 4 caracteres alfanuméricos.
// Verifica que la cadena tenga un formato de dirección de correo electrónico válido.
// Validación de URL Simple (http o https):

// ^https?:\/\/\w+(\.\w+)+([\w\-\._~,:%\/?#\[\]@!$&'()*+\;=]*)?$
// ^https?:\/\/ verifica que la cadena comience con http:// o https://.
// \w+(\.\w+)+ verifica que después de http:// o https:// haya uno o más caracteres alfanuméricos seguidos de uno o más segmentos que contengan un punto (.) y caracteres alfanuméricos.
// ([\w\-\._~,:%\/?#\[\]@!$&'()*+\;=]*)? verifica que la URL pueda contener caracteres especiales y otros elementos de URL opcionales.
// Verifica que la cadena tenga un formato básico de URL que comience con http:// o https://.
// Validación de Nombre de Usuario (entre 3 y 16 caracteres alfanuméricos):

// ^[A-Za-z0-9_-]{3,16}$
// ^[A-Za-z0-9_-] verifica que la cadena comience con cualquier letra mayúscula o minúscula, número, guion bajo (_) o guion (-).
// {3,16} verifica que la longitud de la cadena esté entre 3 y 16 caracteres.
// Verifica que la cadena contenga solo caracteres alfanuméricos, guiones o guiones bajos, y tenga una longitud válida.
// Validación de Formato de Fecha (dd/mm/yyyy):

// ^\d{2}\/\d{2}\/\d{4}$
// \d{2}\/\d{2}\/\d{4} verifica que la cadena contenga exactamente dos dígitos para el día, seguidos de /, luego dos dígitos para el mes, seguidos de /, y finalmente cuatro dígitos para el año.
// Verifica que la cadena tenga el formato dd/mm/yyyy para una fecha válida.
