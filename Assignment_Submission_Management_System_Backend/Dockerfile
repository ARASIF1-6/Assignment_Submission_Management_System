# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Assignment_Submission_Management_System_Backend/Assignment_Submission_Management_System_Backend.csproj", "Assignment_Submission_Management_System_Backend/"]

# Restore dependencies
RUN dotnet restore "Assignment_Submission_Management_System_Backend/Assignment_Submission_Management_System_Backend.csproj"

# Copy full source code
COPY . .

# Build and publish
WORKDIR "/src/Assignment_Submission_Management_System_Backend"
RUN dotnet publish "Assignment_Submission_Management_System_Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 7051

ENV ASPNETCORE_URLS=http://+:7051
ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Assignment_Submission_Management_System_Backend.dll"]
