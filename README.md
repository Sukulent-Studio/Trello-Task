# Trello-Task

## ER-диаграмма

В базе данных присутствует четыре сущности: Пользователь, Колонка, Карточка, Комментарий. Связи между ними представлены на схеме ниже.

![ER-диаграмма](/doc/Trello-task.png)

## Запуск

Для запуска проекта необходимо наличие Docker, Docker-Compose и Git на устройстве.

Во-первых, скопруйте репозиторий.

`git clone https://github.com/Sukulent-Studio/Trello-Task.git`

Далее, Вам необходимо создать `.env` фалй в корне проекта похожего содержания:

```txt

POSTGRES_USER=myuser
POSTGRES_PASSWORD=mysupersecret
POSTGRES_DB=mydatabase
APP_PORT=3000
DB_PORT=5432
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10

```

Затем, находясь в корне проекта, выполните команду:

`docker-compose up --build`

Приложение запущено.

---

Доступ к API будет открыт по адресу `localhost:${APP_PORT}/`

Доступ к Swagger документации будет доступен по адресу `localhost:${APP_PORT}/docs`
