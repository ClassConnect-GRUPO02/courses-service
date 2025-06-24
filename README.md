# Courses-service

## Correr el proyecto

Antes de correr el proyecto se debe contar con las siguientes herramientas:
- Docker
- Docker compose

Además se debe configurar un archivo .env con las siguientes variables:

```dotenv
HOST=0.0.0.0
PORT=3000
DB_USER=root
DB_PASSWORD=admin
DB_HOST=mysql
DB_PORT=3306
DB_NAME=courses_db
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
ENVIRONMENT=development
# CHATGPT API
OPENAI_API_KEY=secret_key
# JWT KEY
SECRET_KEY=secret_key 
# Esta clave debe coincidir con la del servicio de usuarios para que funcionen en conjunto
```
Esto también se puede encontrar en el archivo [`.env.example`](./.env.example)


Luego, para correr el proyecto se puede usar docker ejecutando en la terminal:

```bash
docker compose up --build # Instala las imágenes, instala las dependencias, corre la API y crea los contenedores junto con el volumen de la base de datos.
```

## Correr los tests

Para correr los tests, se puede hacer de 2 formas:

**Sin usar docker:**
```bash
npm install # Se instalan las dependencias
npm test # Se ejecutan los tests
```

**Accediendo al contenedor de docker:**

```bash
docker exec -it cursos-app sh # Se accede a la terminal del contenedor
npm test # Se ejecutan los tests
```

## Acceder a la base de datos:

**Sin gestor de bdd (Usando prisma studio con docker):**

Ejecutar en una terminal:
```bash
docker exec -it cursos-app sh
npx prisma studio --hostname 0.0.0.0 --port 5555
```

Luego en un navegador abrir:
`localhost:5555`

**Con un gestor de bdd (Por ejemplo, DBeaver):**

1 - Abrir DBeaver

2 - Seleccionar nueva conexión -> MySQL

3 - Completar los datos con:
- Host:        localhost
- Port:        3307 *(esto puede variar si el contenedor expone otro puerto)*
- Database:    courses_db
- User:        root
- Password:    admin

*Esto dependiendo de los datos definidos en el archivo .env*


## Frenar o borrar los contenedores

Para detener los contenedores: 

```bash
docker compose down
```

Esto va a generar que los contenedores se detengan pero la base de datos permanezca en el disco (sin poder conectarse a la misma hasta ejecutar nuevamente `docker compose up`)

Para borrar los contenedores y **el volumen de la bdd** (es decir, borrar también la bdd):

```bash
docker compose down -v
```

## Usar semilla en la bdd para cargarle datos (Precaución: Borra los datos guardados antes de cargar los de la semilla)

```bash
docker exec -it cursos-app npm run seed
```

Esto ejecutará la semilla en el contenedor de la api


## Ver documentación de los endpoints

1. Abrir [Swagger Editor](https://editor.swagger.io/)
2. Copiar el contenido del archivo [`endpoints.yaml`](./endpoints.yaml)
3. Pegarlo en el editor para visualizar la documentación en formato Swagger

## Seguridad en las solicitudes

Para la seguridad en las solicitudes trabajamos con un token JWT, este token se codifica como un string que se encuentra compuesto por 3 partes, separadas cada una por un punto:

`<HEADER>.<PAYLOAD>.<SIGNATURE>`

Ejemplo:

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  eyJpZCI6IjEyMyIsInVzZXJUeXBlIjoiSU5TVFJVQ1RPUiJ9.        SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`             
- Header: especifica el algoritmo de firma, como HS256.

- Payload: datos del usuario (por ejemplo, id, userType, etc.).

- Signature: una firma digital generada así:

`HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)`

Esto es seguro porque no se puede modificar el contenido (payload) sin invalidar la firma digital. Cuando el servidor recibe el token, vuelve a generar la firma con el header + payload y la clave secreta. Si la firma no coincide con la del token recibido → el token es inválido o ha sido alterado.

Si un usuario quisiera modificar el payload para cambiar de rol por ejemplo, NO podría generar una firma válida, porque no tiene la clave secreta del servidor.

En los siguientes diagramas de secuencia se muestran los casos en los que se desean borrar una tarea y obtener las entregas de una tarea con sus respectivas variantes:

<h3>Diagrama de secuencia - Eliminar una tarea</h3>

<img src="./UML/delete_task.png" alt="Diagrama de secuencia - Delete Task" width="800" />

Se puede ver en el diagrama que cuando el usuario desea borrar una tarea, envía la solicitud correspondiente con el token JWT que contiene encriptada la información del usuario (Id, Tipo de usuario = Alumno o profesor).

Una vez que llega al servidor se verifica que el token sea válido, esto es que tanto el header como el payload como la firma sean consistentes. En caso de no serlo, se devuelve el error 401 Unauthorized.

Luego se procede a la verificación de que la información del usuario dentro del token esté completa, en caso contrario se envía un error 401.

Una vez verificada esta información se procede a eliminar la tarea, para ello se verifica que el curso pasado en la request exista, sino se devuelve un error 404 Not Found. Después se verifica que el instructor sea realmente instructor de ese curso y si no lo fuera se devuelve un error AuthorizationError 403.

Finalmente se procede a eliminar la tarea y se devuelve el código 204 No Content, que demuestra que la tarea fue eliminada con éxito.

<h3>Diagrama de secuencia - Obtener todas las entregas de una tarea de un curso (sólo para profesores)</h3>

<img src="./UML/get_task_submissions.png" alt="Diagrama de secuencia - Get Tasks" width="800" />

En el siguiente diagrama se muestra la secuencia del endpoint que permite a un profesor obtener todas las entregas de una tarea específica.

Al igual que en el diagrama anterior se puede ver que primero se verifica que la información del token sea válida.

Se puede ver que en el caso en el que el rol del usuario (obtenido del token JWT) no es el de profesor, se devuelve el error 403 Forbidden. Lo mismo sucede si el id del instructor dentro del token no coincide con el id de la request.

Una vez que se verifica que el usuario es instructor y su id es el mismo del de la rquest, se procede a pedir las entregas de una tarea. Para ello se verifica que el instructor sea realmente un instructor del curso pasado en la request y en caso de serlo, se devuelve la información con código 200 Ok.

<h3>Pruebas con Postman - Obtención de tareas exitosa</h3>

<img src="./UML/get_submissions_ok.png" alt="Postman - submissions ok" width="800" />

Se obtienen las entregas de la tarea "t1"  porque el usuario con id igual a '5' es profesor del curso.

<img src="./UML/get_submissions_token_dif_from_request.png" alt="Postman - submissions error 1" width="800" />

En este caso se obtiene el mensaje de error que corresponde a que el id del token '7' no coincide con el id pasado en la request que es '5', por lo que se obtiene un error 403 Forbidden.

<img src="./UML/get_submissions_without_being_professor_of_that_course.png" alt="Postman - submissions error 1" width="800" />

Este último caso representa que el usuario es un docente pero no es docente del curso donde se publicó la tarea "t1", por lo que pasa las verificaciones del token, pero no se encuentra como profesor del curso en la base de datos, generando así un error 403 Forbidden.