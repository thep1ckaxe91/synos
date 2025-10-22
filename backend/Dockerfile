FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Synos.Api.csproj", "./"]
RUN dotnet restore "Synos.Api.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "Synos.Api.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "Synos.Api.dll"]
