# Aplicación Event-Driven con Node.js, TypeScript, MySQL y Docker

Esta guía te ayudará a construir una API REST básica para gestionar eventos, utilizando una arquitectura event-driven con Node.js, TypeScript, MySQL y Docker. La aplicación está diseñada para ser robusta, con una arquitectura limpia y funcional desde el inicio. Utiliza EventEmitter para la gestión de eventos, TypeORM para la interacción con la base de datos, y Docker Compose para la orquestación de los servicios.

## Estructura del Proyecto

```
event-driven-app/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── events/
│   │   └── notification.event.ts
│   ├── entities/
│   │   └── Notification.ts
│   ├── controllers/
│   │   └── notification.controller.ts
│   ├── routes/
│   │   └── notification.routes.ts
│   ├── app.ts
│   └── server.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env
```

## Paso 1: Configuración del Proyecto

Inicializa el proyecto y añade las dependencias necesarias.

### `package.json` (Explicación detallada en la respuesta anterior)

### `tsconfig.json` (Explicación detallada en la respuesta anterior)

Ejecuta `npm install` para instalar las dependencias.

## Paso 2: Configuración de la Base de Datos

Usaremos TypeORM para conectarnos a MySQL.

### `src/config/database.ts` (Explicación detallada en la respuesta anterior)

### `src/entities/Notification.ts` (Explicación detallada en la respuesta anterior)

## Paso 3: Sistema de Eventos

Creamos un manejador de eventos con EventEmitter.

### `src/events/notification.event.ts` (Explicación detallada en la respuesta anterior)

## Paso 4: Controlador y Rutas

Creamos una API REST para disparar eventos.

### `src/controllers/notification.controller.ts` (Explicación detallada en la respuesta anterior)

### `src/routes/notification.routes.ts` (Explicación detallada en la respuesta anterior)

## Paso 5: Aplicación y Servidor

Conectamos todo en Express.

### `src/app.ts` (Explicación detallada en la respuesta anterior)

### `src/server.ts`

```typescript
import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
```

**Explicación `server.ts`:**

*   **`import "dotenv/config"`**:  Carga las variables de entorno desde el archivo `.env`.  Esto debe hacerse antes de importar cualquier otro módulo que dependa de las variables de entorno.
*   **`import app from "./app"`**: Importa la instancia de la aplicación Express.
*   **`import { AppDataSource } from "./config/database"`**: Importa la configuración de la base de datos.
*   **`const PORT = process.env.PORT || 3000`**:  Define el puerto en el que se ejecutará el servidor (se lee de la variable de entorno `PORT`, o se usa `3000` por defecto).
*   **`async function startServer() { ... }`**:  Define una función asíncrona `startServer` que inicializa la base de datos y arranca el servidor.
    *   **`try { ... } catch (error) { ... }`**:  Un bloque `try...catch` para manejar posibles errores durante la inicialización.
    *   **`await AppDataSource.initialize()`**:  Inicializa la conexión a la base de datos (usando la configuración de `AppDataSource`).  `await` espera a que la conexión se establezca antes de continuar.
    *   **`console.log("Database connected successfully")`**: Muestra un mensaje en la consola si la conexión se establece correctamente.
    *   **`app.listen(PORT, () => { ... })`**: Inicia el servidor Express y lo pone a escuchar en el puerto especificado.
        *   **`console.log(`Server running on port ${PORT}`)`**:  Muestra un mensaje en la consola cuando el servidor se inicia correctamente.
    *   **`console.error("Error starting server:", error)`**:  Muestra un mensaje de error en la consola si ocurre algún error durante la inicialización.
* **`startServer()`:** Llama a la función `startServer` para iniciar todo el proceso.

## Paso 6: Contenerización

### `.env`

```plaintext
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=event_db
PORT=3000
```

**Explicación `.env`:**

Este archivo contiene las variables de entorno para la aplicación.  Las variables de entorno son una forma de configurar la aplicación sin tener que modificar el código.

*   **`DB_HOST`**: El host de la base de datos (en este caso, `mysql`, que es el nombre del servicio de MySQL en `docker-compose.yml`).
*   **`DB_PORT`**: El puerto de la base de datos.
*   **`DB_USER`**: El nombre de usuario de la base de datos.
*   **`DB_PASSWORD`**: La contraseña de la base de datos.
*   **`DB_NAME`**: El nombre de la base de datos.
*   **`PORT`**: El puerto en el que se ejecutará la aplicación.

### `Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
```

**Explicación `Dockerfile`:**

Este archivo define cómo construir la imagen de Docker de la aplicación.

*   **`FROM node:18-alpine`**:  Especifica la imagen base (una imagen de Node.js 18 basada en Alpine Linux, que es una distribución de Linux muy pequeña).
*   **`WORKDIR /app`**:  Establece el directorio de trabajo dentro del contenedor en `/app`.
*   **`COPY package*.json ./`**: Copia los archivos `package.json` y `package-lock.json` al directorio de trabajo del contenedor.
*   **`RUN npm install`**:  Instala las dependencias de la aplicación dentro del contenedor.
*   **`COPY . .`**: Copia el resto del código fuente de la aplicación al contenedor.
*   **`RUN npm run build`**: Compila el código TypeScript a JavaScript.
*   **`CMD ["npm", "start"]`**:  Especifica el comando que se ejecutará cuando se inicie el contenedor (en este caso, `npm start`, que ejecutará el script `start` definido en `package.json`).

### `docker-compose.yml`

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=event_db
    depends_on:
      - mysql
    volumes:
      - .:/app
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=event_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
volumes:
  mysql-data:
```

**Explicación `docker-compose.yml`:**

Este archivo define los servicios que componen la aplicación (la aplicación en sí y la base de datos MySQL) y cómo se relacionan entre sí.

*   **`version: "3.8"`**:  La versión del formato de archivo de Docker Compose.
*   **`services`**:  Define los servicios.
    *   **`app`**:  El servicio de la aplicación.
        *   **`build: .`**:  Indica que la imagen de Docker se construirá a partir del `Dockerfile` en el directorio actual.
        *   **`ports`**:  Mapea el puerto 3000 del contenedor al puerto 3000 del host (para que puedas acceder a la aplicación desde tu navegador).
        *   **`environment`**:  Define las variables de entorno para el contenedor de la aplicación (estas variables se usarán en `src/config/database.ts` y `src/server.ts`).  Nota que se están pasando las mismas definidas en el archivo `.env`.
        *   **`depends_on`**:  Indica que el servicio `app` depende del servicio `mysql` (Docker Compose se asegurará de que el servicio `mysql` se inicie antes que el servicio `app`).
        *   **`volumes`**:
            * `- .:/app`: Monta el directorio actual del host (`.`) en el directorio `/app` del contenedor.  Esto permite que los cambios que hagas en el código fuente se reflejen inmediatamente en el contenedor (útil para el desarrollo). *Importante:* este volumen sobrescribe el código que se copió durante el `build` del Dockerfile, por lo que si haces cambios que requieran una reconstrucción (por ejemplo, instalar nuevas dependencias), tendrás que reconstruir la imagen.

    *   **`mysql`**:  El servicio de la base de datos MySQL.
        *   **`image: mysql:8.0`**:  Especifica la imagen de Docker que se utilizará (MySQL 8.0).
        *   **`environment`**:  Define las variables de entorno para el contenedor de MySQL (en este caso, la contraseña de root y el nombre de la base de datos).
        *   **`ports`**: Mapea el puerto 3306 (puerto por defecto de MySQL) del contenedor al puerto 3306 del host.
        *    **`volumes`**:
            * `- mysql-data:/var/lib/mysql`: Monta un volumen llamado `mysql-data` en el directorio `/var/lib/mysql` del contenedor (donde MySQL almacena los datos). Este volumen persiste los datos de la base de datos incluso si el contenedor se elimina.

* **`volumes`**: Define el volumen `mysql-data`.

## Paso 7: Ejecución

Asegúrate de tener Docker y Docker Compose instalados.

En la raíz del proyecto, ejecuta:

```bash
docker-compose up --build
```

La aplicación estará disponible en http://localhost:3000.

## Prueba de la API

Usa un cliente como Postman o curl para probar:

```bash
curl -X POST http://localhost:3000/api/notifications \
-H "Content-Type: application/json" \
-d '{"message": "User logged in", "type": "INFO"}'
```

Verás en la consola cómo se guarda la notificación en MySQL gracias al evento disparado.

## Notas Finales

*   **Arquitectura Event-Driven:** La lógica de negocio está desacoplada gracias al uso de EventEmitter para manejar eventos. Esto facilita la escalabilidad y el mantenimiento.
*   **Contenerización:** Docker Compose simplifica la configuración y el despliegue de la aplicación y la base de datos MySQL. Esto asegura un entorno consistente en desarrollo y producción.
*   **Código Limpio y Tipado:** El uso de TypeScript proporciona un tipado estático, lo que ayuda a prevenir errores en tiempo de ejecución y mejora la legibilidad del código. La estructura modular facilita la organización y la extensibilidad.
*   **Dependencias:** Se utilizaron versiones especificas de las dependencias para asegurar la compatibilidad.
*   **Scripts:** El package.json incluye scripts convenientes para construir, iniciar y desarrollar la aplicacion.
*   **Base de datos:** La sincronizacion de TypeORM se establece a true *solo para desarrollo*. Esto debe cambiarse para ambientes de producción.
*   **Volumen de mysql:** El volumen 'mysql-data' se configura para la persistencia de datos de la instancia de MySQL.
* **Manejo de Errores y Validación**: El ejemplo actual tiene un manejo de errores *muy* básico y una validación mínima. En una aplicación real, deberías implementar un manejo de errores más robusto (por ejemplo, usando un middleware de manejo de errores en Express y devolviendo códigos de estado HTTP y mensajes de error más informativos) y una validación de datos de entrada más completa (por ejemplo, usando una biblioteca como `class-validator`).

## Ampliaciones Futuras (Opcional)

Si necesitas agregar más funcionalidades, considera:

*   **WebSockets:** Para notificaciones en tiempo real al cliente.
*   **Más Entidades:** Ampliar el modelo de datos para manejar diferentes tipos de eventos o entidades relacionadas.
*   **Frontend:** Desarrollar una interfaz de usuario para interactuar con la API.
*   **Autenticación y Autorización:** Implementar un sistema de seguridad para proteger la API.
*   **Tests:** Añadir pruebas unitarias y de integración para asegurar la calidad del código.
* **Manejo de Errores Mejorado**: Implementar un manejo de errores más sofisticado, con respuestas de error más descriptivas y logging detallado.
* **Validación de Datos de Entrada**: Añadir una capa de validación de datos más robusta, posiblemente utilizando una librería como `class-validator`.
* **Uso de Migraciones**: En lugar de `synchronize: true`, usar migraciones de TypeORM para controlar los cambios en la base de datos de forma más segura y predecible en producción.
* **Cola de Mensajes (Message Queue)**: Para aplicaciones más complejas, considera integrar una cola de mensajes como RabbitMQ o Redis para gestionar los eventos de forma asíncrona y más escalable.

