# Aplicación Event-Driven con Node.js, TypeScript, MySQL y Docker

Esta guía te ayudará a construir una API REST básica para gestionar eventos, utilizando una arquitectura event-driven con Node.js, TypeScript, MySQL y Docker.  La aplicación está diseñada para ser robusta, con una arquitectura limpia y funcional desde el inicio.  Utiliza EventEmitter para la gestión de eventos, TypeORM para la interacción con la base de datos, y Docker Compose para la orquestación de los servicios.

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

### `package.json`

```json
{
  "name": "event-driven-app",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "typeorm": "^0.3.17",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Ejecuta `npm install` para instalar las dependencias.

## Paso 2: Configuración de la Base de Datos

Usaremos TypeORM para conectarnos a MySQL.

### `src/config/database.ts`

```typescript
import { DataSource } from "typeorm";
import { Notification } from "../entities/Notification";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "mysql",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "event_db",
  synchronize: true, // Solo para desarrollo, crea tablas automáticamente
  logging: true,
  entities: [Notification],
  subscribers: [],
  migrations: [],
});
```

### `src/entities/Notification.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column()
  type!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## Paso 3: Sistema de Eventos

Creamos un manejador de eventos con EventEmitter.

### `src/events/notification.event.ts`

```typescript
import { EventEmitter } from "events";
import { Notification } from "../entities/Notification";
import { AppDataSource } from "../config/database";

export const notificationEmitter = new EventEmitter();

notificationEmitter.on("newNotification", async (message: string, type: string) => {
  const notificationRepo = AppDataSource.getRepository(Notification);
  const notification = new Notification();
  notification.message = message;
  notification.type = type;
  await notificationRepo.save(notification);
  console.log(`Notification saved: ${message} (${type})`);
});
```

## Paso 4: Controlador y Rutas

Creamos una API REST para disparar eventos.

### `src/controllers/notification.controller.ts`

```typescript
import { Request, Response } from "express";
import { notificationEmitter } from "../events/notification.event";

export class NotificationController {
  static async createNotification(req: Request, res: Response) {
    const { message, type } = req.body;
    if (!message || !type) {
      return res.status(400).json({ error: "Message and type are required" });
    }
    // Dispara el evento
    notificationEmitter.emit("newNotification", message, type);
    return res.status(201).json({ message: "Notification event triggered" });
  }
}
```

### `src/routes/notification.routes.ts`

```typescript
import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.post("/notifications", NotificationController.createNotification);

export default router;
```

## Paso 5: Aplicación y Servidor

Conectamos todo en Express.

### `src/app.ts`

```typescript
import express from "express";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(express.json());
app.use("/api", notificationRoutes);

export default app;
```

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

*   **Arquitectura Event-Driven:**  La lógica de negocio está desacoplada gracias al uso de EventEmitter para manejar eventos. Esto facilita la escalabilidad y el mantenimiento.
*   **Contenerización:** Docker Compose simplifica la configuración y el despliegue de la aplicación y la base de datos MySQL.  Esto asegura un entorno consistente en desarrollo y producción.
*   **Código Limpio y Tipado:**  El uso de TypeScript proporciona un tipado estático, lo que ayuda a prevenir errores en tiempo de ejecución y mejora la legibilidad del código.  La estructura modular facilita la organización y la extensibilidad.
*   **Dependencias:** Se utilizaron versiones especificas de las dependencias para asegurar la compatibilidad.
*   **Scripts:** El package.json incluye scripts convenientes para construir, iniciar y desarrollar la aplicacion.
*   **Base de datos:** La sincronizacion de TypeORM se establece a true *solo para desarrollo*. Esto debe cambiarse para ambientes de producción.
*   **Volumen de mysql:** El volumen 'mysql-data' se configura para la persistencia de datos de la instancia de MySQL.

## Ampliaciones Futuras (Opcional)

Si necesitas agregar más funcionalidades, considera:

*   **WebSockets:**  Para notificaciones en tiempo real al cliente.
*   **Más Entidades:**  Ampliar el modelo de datos para manejar diferentes tipos de eventos o entidades relacionadas.
*   **Frontend:**  Desarrollar una interfaz de usuario para interactuar con la API.
*   **Autenticación y Autorización:** Implementar un sistema de seguridad para proteger la API.
*   **Tests:** Añadir pruebas unitarias y de integración para asegurar la calidad del código.
* **Manejo de Errores Mejorado**: Implementar un manejo de errores más sofisticado, con respuestas de error más descriptivas y logging detallado.
* **Validación de Datos de Entrada**: Añadir una capa de validación de datos más robusta, posiblemente utilizando una librería como `class-validator`.
* **Uso de Migraciones**: En lugar de `synchronize: true`, usar migraciones de TypeORM para controlar los cambios en la base de datos de forma más segura y predecible en producción.
* **Cola de Mensajes (Message Queue)**: Para aplicaciones más complejas, considera integrar una cola de mensajes como RabbitMQ o Redis para gestionar los eventos de forma asíncrona y más escalable.

