# One image with both parts: the backend serves the built frontend from wwwroot,
# so the app has a single address and the frontend's relative /api calls just work.

# 1. Build the frontend
FROM node:24-alpine AS frontend
WORKDIR /src
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

# 2. Build the backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src
COPY Backend/WebAPI/WebAPI.csproj Backend/WebAPI/
RUN dotnet restore Backend/WebAPI/WebAPI.csproj
COPY Backend/ Backend/
RUN dotnet publish Backend/WebAPI/WebAPI.csproj -c Release -o /app --no-restore

# 3. Run: the backend, with the frontend in wwwroot
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend /app ./
COPY --from=frontend /src/dist ./wwwroot
# The .NET image listens on port 8080 by default. Expose that port on the hosting platform.
EXPOSE 8080
ENTRYPOINT ["dotnet", "WebAPI.dll"]
