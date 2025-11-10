FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Install EF Core tools globally
RUN dotnet tool install --global dotnet-ef --version 9.0.0
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy csproj từ thư mục Synos.Api
COPY ["Synos.Api/Synos.Api.csproj", "Synos.Api/"]
RUN dotnet restore "Synos.Api/Synos.Api.csproj"

# Copy all source code
COPY . .

# Build the project in Debug mode for migrations (build in place)
WORKDIR "/src/Synos.Api"
RUN dotnet build "Synos.Api.csproj" -c Debug

FROM build AS publish
RUN dotnet publish "Synos.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS final
WORKDIR /app

# Install EF Core tools in final image
RUN dotnet tool install --global dotnet-ef --version 9.0.0
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy published application
COPY --from=publish /app/publish .

# Copy source code and build artifacts for migrations
COPY --from=build /src/Synos.Api /app/source

# Copy scripts
COPY scripts/ /app/scripts/

# Make scripts executable
RUN chmod +x /app/scripts/*.sh

# Install netcat, mysql client, and dos2unix for database connection testing, verification, and script formatting
RUN apt-get update && apt-get install -y netcat-openbsd default-mysql-client dos2unix && rm -rf /var/lib/apt/lists/*

# Convert script line endings from CRLF to LF
RUN dos2unix /app/scripts/*.sh

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["/app/scripts/migrate.sh"]
