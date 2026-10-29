# Kanban

En enkel kanban-tavla där kolumner och swimlanes skapas i gränssnittet och uppgifter dras mellan cellerna.

- **Backend:** ASP.NET Core (.NET 10) + EF Core + PostgreSQL (`Backend/WebAPI`)
- **Frontend:** React + TypeScript + Vite (`Frontend`)

## Kom igång

```sh
docker compose up -d                                       # PostgreSQL på localhost:5432
dotnet run --project Backend/WebAPI --launch-profile http   # API på http://localhost:5265, migrerar databasen automatiskt
cd Frontend && npm install && npm run dev                  # http://localhost:5173, /api proxas till backenden
```

Anslutningssträngen ligger i `Backend/WebAPI/appsettings.Development.json`.

## Databasändringar

```sh
cd Backend/WebAPI
dotnet ef migrations add <Namn>
```

Migrationer körs automatiskt vid uppstart, i alla miljöer.

## Deploy (Northflank)

`Dockerfile` i roten bygger en image med båda delarna: backenden serverar den byggda frontenden från `wwwroot`, så appen har en adress och frontendens `/api`-anrop fungerar utan extra konfiguration.

- Bygg från `Dockerfile` i repots rot.
- Containern lyssnar på port `8080` (http). Northflank sköter https framför den.
- Miljövariabel: `ConnectionStrings__Board` = anslutningssträngen till Postgres, i formatet `Host=…;Port=…;Database=…;Username=…;Password=…`.
