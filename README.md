# Frontend LLVM implementation for jsonlang

Este proyecto compila un script escrito en jsonlang al Intermediate Representation (IR) de LLVM

## Paquetes requeridos y Setup (Linux)

Para compilar y ejecutar el proyecto y sus tests de integracion es necesario instalar los siguientes paquetes

```
sudo apt install llvm clang cmake 
```

Luego, para inicializar el entorno con Deno se debe ejecutar:

```
make setup
```

Finalmente para compilar el web service que corren los test de integracion:

```
make compileinteg
```

## Ejecucion

Para correr el compilador, usar el siguiente comando, reemplazando FILE por el path relativo del archivo .json que contiene el codigo a compilar

```
make run file_in=FILE
```

## Testing

Primero se debe inicializar el web service que recibe codigo compilado y lo ejecuta

```
make integws
```

Una vez hecho esto, se pueden correr los tests individualmente desde VSCode o ejecutar la suite completa

```
make test
```

## Preguntas

* **¿Cómo se traduce el `if` a esta plataforma o VM?**
  
    Para implementar el control de flujo con if se debe usar la instruccion de salto `br` junto un conjunto de etiquetas definidas con `label`

    Por ejemplo:

    ```
    br i1 %cond, label %iftrue, label %iffalse
    ```
    
    saltara a `iftrue` si `%cond` vale 1, y saltara a `%iffalse` en caso contrario

* **¿Cómo se traduce el `while` a esta plataforma o VM?**
    
    Seutiliza la misma estrategia que el caso del `if` pero organizando los saltos de manera que se repita la ejecuccion del codigo de loop

* **¿Cómo se traduce `call` a esta plataforma o VM?**
    
    En el IR existe la instruccion `call` que cumple ese proposito. Por ejemplo:

    ```
    %0 = call i32 @factorial(i32 10)
    ```

    Llama a la funcion `factorial` con el argumento `10` de tipo `i32` y devuelve su resultado en `%0` de tipo `i32`

* **¿Cómo se traduce `return` a esta plataforma o VM?**

    Se traduce como la instruccion `ret`

    ```
    ret i32 0
    ```

    El tipo de dato debe coincidir con el tipo de dato usado en `define` al definir la funcion

* **¿Cómo se traduce `DeclarationStatement` (declaración de funciones) a esta plataforma o VM?**
  
  Se traduce con la instruccion `define`

  ```
  define i32 @factorial(i32) {
  entry:
    ...
  }
  ```

  Las partes del define son respectivamente:
  - Tipo de dato de retorno
  - Nombre de la funcion que se usara en el `call`
  - lista de argumentos. Se almacenan en registros `%0`, `%1`, etc
  - Bloque de funcion. El bloque se inicializa con una etiqueta, por lo general se nombra `entry`
  
* **¿Cómo se traducen las expresiones a esta plataforma o VM?**
  
  Este compilador recorre las expresiones recursivamente, pero se deben traducir a instrucciones que toman dos operandos y devuelven un valor luego de ejecutar una operacion aritmetica. Por ejemplo:

  ```
  %sub = sub i32 %0, 1
  ```

  Adicionalmente, es requisito cumplir con SSA (Static Single Assignment), que exige que los registros se asignen solo una vez.
  Por esto, cada vez que se llega a un nodo hoja de la recursividad (como el literal `4`), se asigna un nuevo registro con una instruccion dummy, como `%0 = add i32 4, 0`.

  El registro de salida se usara luego al recorrer la operacion, donde se consumen los ultimos registros que se generaron.

  Ejemplo: La operacion `out = 1 + 2` se traduce como

  ```
  %1 = add i32 2, 0
  %2 = add i32 1, 0
  %3 = add i32 %1, %2
  %out = add i32 %3, 0
  ```

* **Listar él o los links que resultaron más útiles para responder esas preguntas.**

  ### **Referencias**
  - LLVM language Reference: https://llvm.org/docs/LangRef.html
  - LLVM Frontend creation example using SDK: https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html
  - Understanding LLVM IR: https://mukulrathi.com/create-your-own-programming-language/llvm-ir-cpp-api-tutorial/
  - Mapping High Level Constructs to LLVM IR: https://buildmedia.readthedocs.org/media/pdf/mapping-high-level-constructs-to-llvm-ir/latest/mapping-high-level-constructs-to-llvm-ir.pdf