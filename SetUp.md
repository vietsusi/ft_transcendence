# FT_TRANSCENDENCE - Project Setup Guide

## 1. Prerequisites

### Check Docker
Run in terminal:
```bash
docker --version
docker-compose version

If not have docker please install
1.1 Linux:
    sudo apt-get update
    sudo apt-get install docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker

# 2. Clone the repository and remember to switch to main branch
git clone git@github.com:vietsusi/ft_transcendence.git
cd ft_transcendence
git checkout main

# 3. Basic Running
# Build
docker-compose -f ./docker-compose.yml up -d --build

# Stop all services
docker compose -f ./docker-compose.yml down

# Clean
docker system prune -a -f --volumes

# 4. Basic Testing
4.1. Check status
docker ps -a

Expected output:
CONTAINER ID   IMAGE                       COMMAND                  CREATED          STATUS                    PORTS                                       NAMES
b91530ddbd9f   ft_transcendence-frontend   "docker-entrypoint.s…"   21 seconds ago   Up 6 seconds              0.0.0.0:5174->5174/tcp, :::5174->5174/tcp   transcendence_frontend
19cd0015da8f   ft_transcendence-backend    "docker-entrypoint.s…"   27 seconds ago   Up 7 seconds              0.0.0.0:5000->5000/tcp, :::5000->5000/tcp   transcendence_backend
333f92ce0166   postgres:15-alpine          "docker-entrypoint.s…"   28 seconds ago   Up 19 seconds (healthy)   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   transcendence_postgres


4.2 Check Log
4.2.1. For PostgreSQL
docker logs transcendence_postgres
Expected output:
The files belonging to this database system will be owned by user "postgres".
This user must also own the server process.

The database cluster will be initialized with locale "en_US.utf8".
The default database encoding has accordingly been set to "UTF8".
The default text search configuration will be set to "english".

Data page checksums are disabled.

fixing permissions on existing directory /var/lib/postgresql/data ... ok
creating subdirectories ... ok
selecting dynamic shared memory implementation ... posix
selecting default max_connections ... 100
selecting default shared_buffers ... 128MB
selecting default time zone ... UTC
creating configuration files ... ok
running bootstrap script ... ok
sh: locale: not found
2026-08-13 09:48:43.523 UTC [35] WARNING:  no usable system locales were found
performing post-bootstrap initialization ... ok
initdb: warning: enabling "trust" authentication for local connections
initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
syncing data to disk ... ok


Success. You can now start the database server using:

    pg_ctl -D /var/lib/postgresql/data -l logfile start

waiting for server to start....2026-08-13 09:48:45.261 UTC [41] LOG:  starting PostgreSQL 15.18 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
2026-08-13 09:48:45.295 UTC [41] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-08-13 09:48:45.415 UTC [44] LOG:  database system was shut down at 2026-08-13 09:48:44 UTC
2026-08-13 09:48:45.457 UTC [41] LOG:  database system is ready to accept connections
 done
server started
CREATE DATABASE


/usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*

waiting for server to shut down....2026-08-13 09:48:45.674 UTC [41] LOG:  received fast shutdown request
2026-08-13 09:48:45.707 UTC [41] LOG:  aborting any active transactions
2026-08-13 09:48:45.709 UTC [41] LOG:  background worker "logical replication launcher" (PID 47) exited with exit code 1
2026-08-13 09:48:45.709 UTC [42] LOG:  shutting down
2026-08-13 09:48:45.740 UTC [42] LOG:  checkpoint starting: shutdown immediate
2026-08-13 09:48:46.142 UTC [42] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.089 s, sync=0.215 s, total=0.434 s; sync files=301, longest=0.122 s, average=0.001 s; distance=4249 kB, estimate=4249 kB
2026-08-13 09:48:46.148 UTC [41] LOG:  database system is shut down
 done
server stopped

PostgreSQL init process complete; ready for start up.

2026-08-13 09:48:46.250 UTC [1] LOG:  starting PostgreSQL 15.18 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
2026-08-13 09:48:46.250 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-08-13 09:48:46.250 UTC [1] LOG:  listening on IPv6 address "::", port 5432
2026-08-13 09:48:46.310 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-08-13 09:48:46.369 UTC [57] LOG:  database system was shut down at 2026-08-13 09:48:46 UTC
2026-08-13 09:48:46.413 UTC [1] LOG:  database system is ready to accept connections

4.2.2. For Backend
docker logs transcendence_backend
Expected output:
[9:48:57 AM] Starting compilation in watch mode...

[9:48:59 AM] Found 0 errors. Watching for file changes.

[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [NestFactory] Starting Nest application...
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [InstanceLoader] JwtModule dependencies initialized +14ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [InstanceLoader] AuthModule dependencies initialized +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [InstanceLoader] UsersModule dependencies initialized +1ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RoutesResolver] AppController {/api}: +2ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RouterExplorer] Mapped {/api, GET} route +3ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RoutesResolver] AuthController {/api/auth}: +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RouterExplorer] Mapped {/api/auth/register, POST} route +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RouterExplorer] Mapped {/api/auth/login, POST} route +1ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RoutesResolver] UsersController {/api/users}: +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [RouterExplorer] Mapped {/api/users/me, GET} route +0ms
[Nest] 128  - 08/13/2026, 9:48:59 AM     LOG [NestApplication] Nest application successfully started +84ms

4.2.3. For frontend
docker logs transcendence_frontend

Expected output:
  VITE v5.4.21  ready in 163 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: http://172.19.0.4:5174/
  ➜  press h + enter to show help

4.3 Test Backennd
4.3.1 .Test Backend API:
curl http://localhost:5000/api
Expected output: Hello World!%   

4.3.2. Register a User:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
Expected output:
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NjYxNDc0NCwiZXhwIjoxNzg3MjE5NTQ0fQ.5v98l4HUDfsS90orOtG7m2h37uC7CnnyAYB8wi2kh_c","user":{"id":1,"username":"testuser","email":"test@example.com"}}%  

4.3.3. Login test:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

Expected output:
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4NjYxNDgxNSwiZXhwIjoxNzg3MjE5NjE1fQ.3iS9LiJ2lw-lBkgs1Oq1i4dPl1ds8UbVo2zDxI3bWVw","user":{"id":1,"username":"testuser","email":"test@example.com"}}%   

4.4 Test PostgreSQL:
docker exec -it transcendence_postgres psql -U postgres -d transcendence
Expected output:
psql (15.18)
Type "help" for help.

Type: \dt
Expected output:
               List of relations
 Schema |        Name        | Type  |  Owner   
--------+--------------------+-------+----------
 public | User               | table | postgres
 public | _prisma_migrations | table | postgres
(2 rows)
        ^
Type: SELECT * FROM "User";
Expected output:
 id | username |      email       |                           password                           
----+----------+------------------+--------------------------------------------------------------
  1 | testuser | test@example.com | $2b$10$SX1SD473PAsBlknj/BxUlOKkWcb3ToawYCi5N3WWkUrOvYs/fcXyG
(1 row)
